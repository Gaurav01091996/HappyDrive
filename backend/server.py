"""
HappyDrive Backend v4.0 — Razorpay Production Payment System
Architecture: Controller → Service → Repository → Payment Gateway
Features: Razorpay orders, signature verification, webhooks,
          retry logic, refunds, duplicate protection, race condition guard
"""
from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Request, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, date, timedelta
import jwt, bcrypt, uuid, os, shutil, pathlib, hmac, hashlib, json
from enum import Enum

app = FastAPI(title="HappyDrive API", version="4.0.0")
app.add_middleware(CORSMiddleware,
    allow_origins=["http://localhost:3000","http://localhost:3001"],
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

MONGO_URL       = os.getenv("MONGO_URL",                 "mongodb://localhost:27017")
DB_NAME         = os.getenv("DB_NAME",                   "happy_drives")
JWT_SECRET      = os.getenv("JWT_SECRET",                "happydrive-secret-change-in-prod")
RZP_KEY_ID      = os.getenv("RAZORPAY_KEY_ID",           "rzp_test_YOUR_KEY_ID")
RZP_SECRET      = os.getenv("RAZORPAY_SECRET",           "YOUR_RAZORPAY_SECRET")
WEBHOOK_SECRET  = os.getenv("RAZORPAY_WEBHOOK_SECRET",   "YOUR_WEBHOOK_SECRET")
MAX_ACTIVE      = 3

# Pickup location charges (in INR)
PICKUP_CHARGES = {
    "Office Location":          0,
    "Guwahati Airport":         500,
    "Guwahati Railway Station": 500,
    "Kamakhya Railway Station": 500,
}

UPLOAD_DIR = pathlib.Path("uploads/vehicles")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

client   = AsyncIOMotorClient(MONGO_URL)
db       = client[DB_NAME]
security = HTTPBearer()

# Razorpay SDK — lazy init so server starts even without key
_rzp = None
def rzp():
    global _rzp
    if _rzp is None:
        import razorpay
        _rzp = razorpay.Client(auth=(RZP_KEY_ID, RZP_SECRET))
    return _rzp

# ── Enums ─────────────────────────────────────────────────────────────────────
class BookingStatus(str, Enum):
    PENDING="pending"; CONFIRMED="confirmed"; REJECTED="rejected"
    CANCELLED="cancelled"; FAILED="failed"; COMPLETED="completed"

class PaymentStatus(str, Enum):
    PENDING="pending"; PAID="paid"; FAILED="failed"; REFUNDED="refunded"

class PaymentMethod(str, Enum):
    CASH="cash"; ONLINE="online"

class DiscountType(str, Enum):
    LONG_TERM="long_term"; SEASONAL="seasonal"; PROMOTIONAL="promotional"

# ── Pydantic Models ───────────────────────────────────────────────────────────
class UserSignup(BaseModel):
    name:str; email:EmailStr; password:str; phone:Optional[str]=None
class UserLogin(BaseModel):
    email:EmailStr; password:str
class UserCreate(BaseModel):
    name:str; email:EmailStr; password:str; phone:Optional[str]=None; is_admin:bool=False
class UserUpdate(BaseModel):
    name:Optional[str]=None; email:Optional[EmailStr]=None
    phone:Optional[str]=None; password:Optional[str]=None; is_admin:Optional[bool]=None
class VehicleCreate(BaseModel):
    name:str; brand:str; model:str; category:str; price_per_day:float
    seats:int; fuel:str; transmission:str; quantity:int=1
    image_url:Optional[str]=None; description:Optional[str]=None
class VehicleUpdate(BaseModel):
    name:Optional[str]=None; brand:Optional[str]=None; model:Optional[str]=None
    category:Optional[str]=None; price_per_day:Optional[float]=None; seats:Optional[int]=None
    fuel:Optional[str]=None; transmission:Optional[str]=None; quantity:Optional[int]=None
    image_url:Optional[str]=None; description:Optional[str]=None; available:Optional[bool]=None
class BookingCreate(BaseModel):
    car_id:str; from_date:date; to_date:date
    promo_code:Optional[str]=None
    payment_method:Optional[PaymentMethod]=PaymentMethod.CASH
    pickup_location:Optional[str]="Office Location"  # "Office Location" | "Guwahati Airport" | "Guwahati Railway Station" | "Kamakhya Railway Station"
class CancelBooking(BaseModel):
    reason:Optional[str]=None
class DiscountCreate(BaseModel):
    name:str; type:DiscountType; description:Optional[str]=None
    min_days:Optional[int]=None; season_start:Optional[date]=None
    season_end:Optional[date]=None; promo_code:Optional[str]=None
    discount_percent:float; active:bool=True
class ReviewCreate(BaseModel):
    vehicle_id:str; booking_id:str; rating:int; comment:Optional[str]=None
class AdminBookingAction(BaseModel):
    action:str
class PaymentVerify(BaseModel):
    booking_id:str; razorpay_order_id:str
    razorpay_payment_id:str; razorpay_signature:str
class PaymentRetry(BaseModel):
    booking_id:str
class RefundRequest(BaseModel):
    booking_id:str; reason:Optional[str]=None

# ── Auth helpers ──────────────────────────────────────────────────────────────
def hash_pw(p): return bcrypt.hashpw(p.encode(),bcrypt.gensalt()).decode()
def check_pw(p,h): return bcrypt.checkpw(p.encode(),h.encode())
def make_token(uid,is_admin=False):
    return jwt.encode({"sub":uid,"is_admin":is_admin,
        "exp":datetime.utcnow()+timedelta(hours=24)},JWT_SECRET,algorithm="HS256")
def decode_token(t):
    try: return jwt.decode(t,JWT_SECRET,algorithms=["HS256"])
    except jwt.ExpiredSignatureError: raise HTTPException(401,"Token expired")
    except jwt.InvalidTokenError: raise HTTPException(401,"Invalid token")
async def get_user(creds:HTTPAuthorizationCredentials=Depends(security)):
    p=decode_token(creds.credentials)
    u=await db.users.find_one({"_id":p["sub"]})
    if not u: raise HTTPException(401,"User not found")
    return u
async def get_admin(creds:HTTPAuthorizationCredentials=Depends(security)):
    p=decode_token(creds.credentials)
    if not p.get("is_admin"): raise HTTPException(403,"Admin access required")
    u=await db.users.find_one({"_id":p["sub"]})
    if not u: raise HTTPException(401,"User not found")
    return u
def ser(doc):
    if not doc: return doc
    doc=dict(doc)
    if "_id" in doc: doc["id"]=str(doc.pop("_id"))
    doc.pop("password",None)
    return doc
def ok(data=None,msg="Success"):
    return {"success":True,"message":msg,"data":data}

# ══════════════════ REPOSITORY ════════════════════════════════════════════════
async def repo_get_vehicle(cid): return await db.vehicles.find_one({"_id":cid})
async def repo_get_booking(bid): return await db.bookings.find_one({"_id":bid})
async def repo_get_booking_by_order(oid): return await db.bookings.find_one({"razorpay_order_id":oid})
async def repo_update_booking(bid,upd): await db.bookings.update_one({"_id":bid},{"$set":upd})
async def repo_get_user_bookings(uid):
    return await db.bookings.find({"user_id":uid}).sort("created_at",-1).to_list(100)
async def repo_get_all_bookings():
    return await db.bookings.find().sort("created_at",-1).to_list(1000)
async def repo_booked_count(car_id,fd,td,exclude=None):
    q={"car_id":car_id,"booking_status":{"$in":["pending","confirmed"]},
       "$or":[{"from_date":{"$lte":str(td),"$gte":str(fd)}},
              {"to_date":{"$lte":str(td),"$gte":str(fd)}},
              {"from_date":{"$lte":str(fd)},"to_date":{"$gte":str(td)}}]}
    if exclude: q["_id"]={"$ne":exclude}
    return await db.bookings.count_documents(q)

# ══════════════════ SERVICE ═══════════════════════════════════════════════════
async def svc_avail_count(car,fd,td):
    cid=car.get("id") or car.get("_id")
    bc=await repo_booked_count(cid,fd,td)
    return max(0,car.get("quantity",1)-bc)

async def svc_calc_discount(price,days,fd,td,promo=None):
    discounts=await db.discounts.find({"active":True}).to_list(100)
    applied=[]; total_pct=0.0
    for d in discounts:
        if d["type"]=="long_term" and d.get("min_days") and days>=d["min_days"]:
            total_pct+=d["discount_percent"]; applied.append(d["name"])
        elif d["type"]=="seasonal" and d.get("season_start") and d.get("season_end"):
            s=d["season_start"] if isinstance(d["season_start"],date) else date.fromisoformat(str(d["season_start"]))
            e=d["season_end"] if isinstance(d["season_end"],date) else date.fromisoformat(str(d["season_end"]))
            if s<=fd<=e: total_pct+=d["discount_percent"]; applied.append(d["name"])
        elif d["type"]=="promotional" and promo:
            if d.get("promo_code","").upper()==promo.upper():
                total_pct+=d["discount_percent"]; applied.append(d["name"])
    total_pct=min(total_pct,50)
    disc_amt=round(price*(total_pct/100),2)
    return {"original_price":round(price,2),"discount_percent":total_pct,
            "discount_amount":disc_amt,"final_price":round(price-disc_amt,2),
            "applied_discounts":applied}

# ══════════════════ PAYMENT GATEWAY SERVICE ═══════════════════════════════════
def pgw_create_order(amount_inr:float, booking_id:str)->dict:
    try:
        return rzp().order.create({
            "amount":int(amount_inr*100),  # paise
            "currency":"INR",
            "receipt":booking_id,
            "notes":{"booking_id":booking_id}
        })
    except Exception as e:
        raise HTTPException(502,f"Razorpay order creation failed: {e}")

def pgw_verify_sig(order_id:str, payment_id:str, signature:str)->bool:
    body=f"{order_id}|{payment_id}"
    expected=hmac.new(RZP_SECRET.encode("utf-8"),body.encode("utf-8"),hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected,signature)

def pgw_verify_webhook_sig(body:bytes, signature:str)->bool:
    expected=hmac.new(WEBHOOK_SECRET.encode("utf-8"),body,hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected,signature)

def pgw_refund(payment_id:str, amount_inr:float)->dict:
    try:
        return rzp().payment.refund(payment_id,{
            "amount":int(amount_inr*100),
            "notes":{"reason":"Booking cancelled via HappyDrive"}
        })
    except Exception as e:
        raise HTTPException(502,f"Razorpay refund failed: {e}")

# ══════════════════ BOOKING SERVICE ══════════════════════════════════════════
async def svc_create_booking(data:BookingCreate,user:dict)->dict:
    car=await repo_get_vehicle(data.car_id)
    if not car: raise HTTPException(404,"Car not found")
    if data.to_date<=data.from_date: raise HTTPException(400,"to_date must be after from_date")
    if data.from_date<date.today(): raise HTTPException(400,"from_date cannot be in the past")
    active=await db.bookings.count_documents(
        {"user_id":user["_id"],"booking_status":{"$in":["pending","confirmed"]}})
    if active>=MAX_ACTIVE: raise HTTPException(400,f"Max {MAX_ACTIVE} active bookings allowed")
    car_s=ser(dict(car))
    avail=await svc_avail_count(car_s,data.from_date,data.to_date)
    if avail<=0: raise HTTPException(409,"No vehicles available for selected dates")

    # Validate pickup location
    pickup_location = data.pickup_location or "Office Location"
    if pickup_location not in PICKUP_CHARGES:
        raise HTTPException(400, f"Invalid pickup location: {pickup_location}")
    pickup_charge = PICKUP_CHARGES[pickup_location]

    days=(data.to_date-data.from_date).days
    pricing=await svc_calc_discount(
        car["price_per_day"]*days,days,data.from_date,data.to_date,data.promo_code)

    # Add pickup charge to final price (after discount, not discountable)
    car_price_after_discount = pricing["final_price"]
    grand_total = round(car_price_after_discount + pickup_charge, 2)

    pm=data.payment_method or PaymentMethod.CASH
    bid="HD"+str(uuid.uuid4())[:8].upper()
    booking={
        "_id":bid,"user_id":user["_id"],"user_name":user["name"],
        "user_email":user["email"],"user_phone":user.get("phone",""),
        "car_id":data.car_id,"car_name":car["name"],"car_brand":car.get("brand",""),
        "car_model":car.get("model",""),"car_image":car.get("image_url",""),
        "from_date":str(data.from_date),"to_date":str(data.to_date),"days":days,
        "price_per_day":car["price_per_day"],"original_price":pricing["original_price"],
        "discount_percent":pricing["discount_percent"],"discount_amount":pricing["discount_amount"],
        "car_price":car_price_after_discount,
        "pickup_location":pickup_location,"pickup_charge":pickup_charge,
        "total_price":grand_total,
        "applied_discounts":pricing["applied_discounts"],
        "promo_code":data.promo_code,"payment_method":pm,
        "payment_status":PaymentStatus.PENDING,"booking_status":BookingStatus.PENDING,
        "razorpay_order_id":None,"razorpay_payment_id":None,"razorpay_signature":None,
        "created_at":datetime.utcnow().isoformat()
    }
    if pm==PaymentMethod.CASH:
        await db.bookings.insert_one(booking)
        return ser(booking)
    order=pgw_create_order(grand_total,bid)
    booking["razorpay_order_id"]=order["id"]
    await db.bookings.insert_one(booking)
    result=ser(dict(booking))
    result.update({"razorpay_order_id":order["id"],"razorpay_key_id":RZP_KEY_ID,
                   "amount":int(grand_total*100),"currency":"INR"})
    return result

async def svc_verify_payment(data:PaymentVerify)->dict:
    booking=await repo_get_booking(data.booking_id)
    if not booking: raise HTTPException(404,"Booking not found")
    # Idempotency — duplicate confirmation ignored
    if booking["booking_status"]==BookingStatus.CONFIRMED:
        return ser(dict(booking))
    if booking["booking_status"]==BookingStatus.CANCELLED:
        raise HTTPException(400,"Cannot confirm a cancelled booking")
    if booking.get("razorpay_order_id")!=data.razorpay_order_id:
        raise HTTPException(400,"Order ID mismatch")
    if not pgw_verify_sig(data.razorpay_order_id,data.razorpay_payment_id,data.razorpay_signature):
        await repo_update_booking(data.booking_id,{
            "payment_status":PaymentStatus.FAILED,"booking_status":BookingStatus.FAILED,
            "razorpay_payment_id":data.razorpay_payment_id})
        raise HTTPException(400,"Payment signature verification failed")
    # Race condition — re-check availability
    fd=date.fromisoformat(booking["from_date"]); td=date.fromisoformat(booking["to_date"])
    car=await repo_get_vehicle(booking["car_id"])
    if car:
        avail=await svc_avail_count(ser(dict(car)),fd,td)
        if avail<=0:
            await repo_update_booking(data.booking_id,{
                "payment_status":PaymentStatus.FAILED,"booking_status":BookingStatus.FAILED})
            raise HTTPException(409,"Vehicle no longer available — payment will be refunded")
    upd={"payment_status":PaymentStatus.PAID,"booking_status":BookingStatus.CONFIRMED,
         "razorpay_payment_id":data.razorpay_payment_id,
         "razorpay_signature":data.razorpay_signature,
         "confirmed_at":datetime.utcnow().isoformat()}
    await repo_update_booking(data.booking_id,upd)
    booking.update(upd)
    return ser(booking)

async def svc_retry_payment(booking_id:str,user:dict)->dict:
    booking=await repo_get_booking(booking_id)
    if not booking: raise HTTPException(404,"Booking not found")
    if booking["user_id"]!=user["_id"]: raise HTTPException(403,"Access denied")
    if booking["booking_status"] not in ["pending","failed"]:
        raise HTTPException(400,"Only pending or failed bookings can be retried")
    if booking.get("payment_method")!=PaymentMethod.ONLINE:
        raise HTTPException(400,"Retry is only for online payments")
    order=pgw_create_order(booking["total_price"],booking_id)
    await repo_update_booking(booking_id,{"razorpay_order_id":order["id"],
        "payment_status":PaymentStatus.PENDING,"booking_status":BookingStatus.PENDING})
    return {"booking_id":booking_id,"razorpay_order_id":order["id"],
            "razorpay_key_id":RZP_KEY_ID,"amount":int(booking["total_price"]*100),
            "currency":"INR","user_name":booking["user_name"],
            "user_email":booking["user_email"],"user_phone":booking.get("user_phone","")}

async def svc_refund(data:RefundRequest,admin:dict)->dict:
    booking=await repo_get_booking(data.booking_id)
    if not booking: raise HTTPException(404,"Booking not found")
    if booking["payment_status"]!=PaymentStatus.PAID:
        raise HTTPException(400,"Only paid bookings can be refunded")
    if not booking.get("razorpay_payment_id"):
        raise HTTPException(400,"No Razorpay payment ID found")
    pgw_refund(booking["razorpay_payment_id"],booking["total_price"])
    await repo_update_booking(data.booking_id,{
        "payment_status":PaymentStatus.REFUNDED,"booking_status":BookingStatus.CANCELLED,
        "cancel_reason":data.reason or "Refund by admin","refunded_at":datetime.utcnow().isoformat()})
    return ok(message="Refund initiated successfully")

# ══════════════════ ROUTES ════════════════════════════════════════════════════
@app.post("/api/auth/signup",status_code=201)
async def signup(data:UserSignup):
    if await db.users.find_one({"email":data.email}): raise HTTPException(400,"Email already registered")
    uid=str(uuid.uuid4())
    await db.users.insert_one({"_id":uid,"name":data.name,"email":data.email,
        "phone":data.phone,"password":hash_pw(data.password),
        "is_admin":False,"created_at":datetime.utcnow().isoformat()})
    return ok({"token":make_token(uid),"user":{"id":uid,"name":data.name,"email":data.email,"is_admin":False}},"Account created")

@app.post("/api/auth/login")
async def login(data:UserLogin):
    u=await db.users.find_one({"email":data.email})
    if not u or not check_pw(data.password,u["password"]): raise HTTPException(401,"Invalid credentials")
    return ok({"token":make_token(u["_id"],u.get("is_admin",False)),
               "user":{"id":u["_id"],"name":u["name"],"email":u["email"],"is_admin":u.get("is_admin",False)}},"Login successful")

@app.get("/api/auth/me")
async def me(u=Depends(get_user)): return ok(ser(dict(u)))

@app.get("/api/cars")
async def get_cars(from_date:Optional[str]=None,to_date:Optional[str]=None):
    cars=[ser(c) for c in await db.vehicles.find().to_list(500)]
    if from_date and to_date:
        fd=date.fromisoformat(from_date); td=date.fromisoformat(to_date)
        for c in cars:
            ac=await svc_avail_count(c,fd,td)
            c["available_count"]=ac; c["is_available_for_dates"]=ac>0
    else:
        for c in cars:
            c["available_count"]=c.get("quantity",1)
            c["is_available_for_dates"]=c.get("available",True)
    return ok({"cars":cars,"total":len(cars)})

@app.get("/api/cars/{car_id}")
async def get_car(car_id:str):
    c=await repo_get_vehicle(car_id)
    if not c: raise HTTPException(404,"Car not found")
    return ok(ser(c))

@app.post("/api/cars",status_code=201)
async def create_car(data:VehicleCreate,admin=Depends(get_admin)):
    cid=str(uuid.uuid4())
    await db.vehicles.insert_one({"_id":cid,**data.dict(),"available":True,"created_at":datetime.utcnow().isoformat()})
    return ok({"id":cid},"Vehicle created")

@app.put("/api/cars/{car_id}")
async def update_car(car_id:str,data:VehicleUpdate,admin=Depends(get_admin)):
    upd={k:v for k,v in data.dict().items() if v is not None}
    if not upd: raise HTTPException(400,"No update data")
    res=await db.vehicles.update_one({"_id":car_id},{"$set":upd})
    if res.matched_count==0: raise HTTPException(404,"Car not found")
    return ok(message="Vehicle updated")

@app.delete("/api/cars/{car_id}")
async def delete_car(car_id:str,admin=Depends(get_admin)):
    res=await db.vehicles.delete_one({"_id":car_id})
    if res.deleted_count==0: raise HTTPException(404,"Car not found")
    return ok(message="Vehicle deleted")

@app.post("/api/cars/{car_id}/upload-image")
async def upload_image(car_id:str,file:UploadFile=File(...),admin=Depends(get_admin)):
    if not file.content_type.startswith("image/"): raise HTTPException(400,"Images only")
    ext=file.filename.split(".")[-1]; fname=f"{car_id}_{uuid.uuid4().hex[:8]}.{ext}"
    with open(UPLOAD_DIR/fname,"wb") as f: shutil.copyfileobj(file.file,f)
    url=f"/uploads/vehicles/{fname}"
    await db.vehicles.update_one({"_id":car_id},{"$set":{"image_url":url}})
    return ok({"image_url":url},"Image uploaded")

@app.get("/api/cars/{car_id}/price-preview")
async def price_preview(car_id:str,from_date:str,to_date:str,promo_code:Optional[str]=None):
    c=await repo_get_vehicle(car_id)
    if not c: raise HTTPException(404,"Car not found")
    fd=date.fromisoformat(from_date); td=date.fromisoformat(to_date); days=(td-fd).days
    if days<=0: raise HTTPException(400,"Invalid dates")
    return ok(await svc_calc_discount(c["price_per_day"]*days,days,fd,td,promo_code))

# ── Booking routes ────────────────────────────────────────────────────────────
@app.post("/api/bookings/create",status_code=201)
async def create_booking(data:BookingCreate,u=Depends(get_user)):
    return ok(await svc_create_booking(data,u),"Booking created successfully")

@app.post("/api/bookings",status_code=201)
async def create_booking_compat(data:BookingCreate,u=Depends(get_user)):
    return ok(await svc_create_booking(data,u),"Booking created successfully")

@app.get("/api/bookings/my")
async def my_bookings(u=Depends(get_user)):
    bs=await repo_get_user_bookings(u["_id"]); return ok([ser(b) for b in bs])

@app.get("/api/bookings/{booking_id}")
async def get_booking(booking_id:str,u=Depends(get_user)):
    b=await repo_get_booking(booking_id)
    if not b: raise HTTPException(404,"Booking not found")
    if b["user_id"]!=u["_id"] and not u.get("is_admin"): raise HTTPException(403,"Access denied")
    return ok(ser(b))

@app.patch("/api/bookings/{booking_id}/cancel")
async def cancel_booking(booking_id:str,data:CancelBooking=None,u=Depends(get_user)):
    b=await repo_get_booking(booking_id)
    if not b: raise HTTPException(404,"Booking not found")
    if b["user_id"]!=u["_id"]: raise HTTPException(403,"Access denied")
    if b["booking_status"] not in ["pending","confirmed"]:
        raise HTTPException(400,f"Cannot cancel a {b['booking_status']} booking")
    if date.fromisoformat(b["from_date"])<=date.today():
        raise HTTPException(400,"Cannot cancel a booking that has already started")
    await repo_update_booking(booking_id,{"booking_status":BookingStatus.CANCELLED,
        "cancel_reason":data.reason if data else None,"cancelled_at":datetime.utcnow().isoformat()})
    return ok(message="Booking cancelled")

# ── Payment routes ────────────────────────────────────────────────────────────
@app.post("/api/payments/verify")
async def verify_payment(data:PaymentVerify,u=Depends(get_user)):
    return ok(await svc_verify_payment(data),"Payment verified successfully")

@app.post("/api/payments/retry")
async def retry_payment(data:PaymentRetry,u=Depends(get_user)):
    return ok(await svc_retry_payment(data.booking_id,u),"New payment order created")

@app.post("/api/payments/refund")
async def refund_payment(data:RefundRequest,admin=Depends(get_admin)):
    return await svc_refund(data,admin)

@app.post("/api/payments/webhook",include_in_schema=False)
async def webhook(request:Request,x_razorpay_signature:Optional[str]=Header(None)):
    body=await request.body()
    if x_razorpay_signature and not pgw_verify_webhook_sig(body,x_razorpay_signature):
        raise HTTPException(400,"Webhook signature mismatch")
    try: event=json.loads(body)
    except: raise HTTPException(400,"Invalid webhook payload")
    etype=event.get("event"); payload=event.get("payload",{})

    if etype in ("payment.captured","order.paid"):
        pe=payload.get("payment",{}).get("entity",{})
        oid=pe.get("order_id"); pid=pe.get("id")
        if oid:
            bk=await repo_get_booking_by_order(oid)
            if bk and bk["booking_status"]!=BookingStatus.CONFIRMED:
                await repo_update_booking(bk["_id"],{"payment_status":PaymentStatus.PAID,
                    "booking_status":BookingStatus.CONFIRMED,"razorpay_payment_id":pid,
                    "confirmed_at":datetime.utcnow().isoformat(),"webhook_confirmed":True})

    elif etype=="payment.failed":
        pe=payload.get("payment",{}).get("entity",{})
        oid=pe.get("order_id"); pid=pe.get("id")
        if oid:
            bk=await repo_get_booking_by_order(oid)
            if bk and bk["booking_status"]==BookingStatus.PENDING:
                await repo_update_booking(bk["_id"],{"payment_status":PaymentStatus.FAILED,
                    "booking_status":BookingStatus.FAILED,"razorpay_payment_id":pid})

    elif etype=="refund.processed":
        re=payload.get("refund",{}).get("entity",{})
        pid=re.get("payment_id")
        if pid:
            bk=await db.bookings.find_one({"razorpay_payment_id":pid})
            if bk: await repo_update_booking(bk["_id"],{"payment_status":PaymentStatus.REFUNDED,
                "booking_status":BookingStatus.CANCELLED,"refunded_at":datetime.utcnow().isoformat()})
    return {"status":"ok"}

# ── Reviews ───────────────────────────────────────────────────────────────────
@app.post("/api/reviews",status_code=201)
async def create_review(data:ReviewCreate,u=Depends(get_user)):
    if not 1<=data.rating<=5: raise HTTPException(400,"Rating must be 1-5")
    b=await repo_get_booking(data.booking_id)
    if not b: raise HTTPException(404,"Booking not found")
    if b["user_id"]!=u["_id"]: raise HTTPException(403,"Access denied")
    if b.get("booking_status") not in ["confirmed","completed"]:
        raise HTTPException(400,"Can only review confirmed bookings")
    if await db.reviews.find_one({"booking_id":data.booking_id,"user_id":u["_id"]}):
        raise HTTPException(400,"Already reviewed")
    rid=str(uuid.uuid4())
    rev={"_id":rid,"user_id":u["_id"],"user_name":u["name"],"vehicle_id":data.vehicle_id,
         "booking_id":data.booking_id,"rating":data.rating,"comment":data.comment,
         "created_at":datetime.utcnow().isoformat()}
    await db.reviews.insert_one(rev)
    return ok(ser(rev),"Review submitted")

@app.get("/api/reviews/vehicle/{vehicle_id}")
async def vehicle_reviews(vehicle_id:str):
    rs=await db.reviews.find({"vehicle_id":vehicle_id}).sort("created_at",-1).to_list(100)
    sr=[ser(r) for r in rs]
    avg=round(sum(r["rating"] for r in sr)/len(sr),1) if sr else 0
    return ok({"reviews":sr,"average_rating":avg,"count":len(sr)})

@app.get("/api/admin/reviews")
async def admin_reviews(admin=Depends(get_admin)):
    rs=await db.reviews.find().sort("created_at",-1).to_list(1000)
    return ok([ser(r) for r in rs])

@app.delete("/api/admin/reviews/{rid}")
async def delete_review(rid:str,admin=Depends(get_admin)):
    res=await db.reviews.delete_one({"_id":rid})
    if res.deleted_count==0: raise HTTPException(404,"Review not found")
    return ok(message="Review deleted")

# ── Admin routes ──────────────────────────────────────────────────────────────
@app.get("/api/admin/bookings")
async def admin_bookings(admin=Depends(get_admin)):
    bs=await repo_get_all_bookings(); return ok([ser(b) for b in bs])

@app.patch("/api/admin/bookings/{booking_id}")
async def admin_update_booking(booking_id:str,data:AdminBookingAction,admin=Depends(get_admin)):
    b=await repo_get_booking(booking_id)
    if not b: raise HTTPException(404,"Booking not found")
    ns=BookingStatus.CONFIRMED if data.action=="confirm" else BookingStatus.REJECTED
    await repo_update_booking(booking_id,{"booking_status":ns})
    return ok(message=f"Booking {ns}")

@app.get("/api/admin/analytics")
async def analytics(admin=Depends(get_admin)):
    confirmed=await db.bookings.find({"booking_status":"confirmed"}).to_list(10000)
    return ok({"total_users":await db.users.count_documents({"is_admin":False}),
        "total_bookings":await db.bookings.count_documents({}),
        "active_bookings":await db.bookings.count_documents({"booking_status":{"$in":["pending","confirmed"]}}),
        "pending_bookings":await db.bookings.count_documents({"booking_status":"pending"}),
        "cancelled_bookings":await db.bookings.count_documents({"booking_status":"cancelled"}),
        "failed_bookings":await db.bookings.count_documents({"booking_status":"failed"}),
        "total_cars":await db.vehicles.count_documents({}),"available_cars":await db.vehicles.count_documents({"available":True}),
        "total_revenue":round(sum(b.get("total_price",0) for b in confirmed),2),
        "total_reviews":await db.reviews.count_documents({})})

@app.get("/api/admin/users")
async def admin_users(admin=Depends(get_admin)):
    us=await db.users.find().sort("created_at",-1).to_list(1000)
    return ok([ser(dict(u)) for u in us])

@app.get("/api/admin/users/{uid}")
async def admin_get_user(uid:str,admin=Depends(get_admin)):
    u=await db.users.find_one({"_id":uid})
    if not u: raise HTTPException(404,"User not found")
    bs=await db.bookings.find({"user_id":uid}).sort("created_at",-1).to_list(100)
    ud=ser(dict(u)); ud["bookings"]=[ser(b) for b in bs]; return ok(ud)

@app.post("/api/admin/users",status_code=201)
async def admin_create_user(data:UserCreate,admin=Depends(get_admin)):
    if await db.users.find_one({"email":data.email}): raise HTTPException(400,"Email taken")
    uid=str(uuid.uuid4())
    await db.users.insert_one({"_id":uid,"name":data.name,"email":data.email,"phone":data.phone,
        "password":hash_pw(data.password),"is_admin":data.is_admin,"created_at":datetime.utcnow().isoformat()})
    return ok({"id":uid},"User created")

@app.put("/api/admin/users/{uid}")
async def admin_update_user(uid:str,data:UserUpdate,admin=Depends(get_admin)):
    upd={k:v for k,v in data.dict().items() if v is not None}
    if "password" in upd: upd["password"]=hash_pw(upd["password"])
    if not upd: raise HTTPException(400,"No update data")
    res=await db.users.update_one({"_id":uid},{"$set":upd})
    if res.matched_count==0: raise HTTPException(404,"User not found")
    return ok(message="User updated")

@app.delete("/api/admin/users/{uid}")
async def admin_delete_user(uid:str,admin=Depends(get_admin)):
    u=await db.users.find_one({"_id":uid})
    if not u: raise HTTPException(404,"User not found")
    if u.get("is_admin"): raise HTTPException(400,"Cannot delete admin")
    await db.users.delete_one({"_id":uid}); return ok(message="User deleted")

@app.get("/api/discounts")
async def public_discounts():
    ds=await db.discounts.find({"active":True}).to_list(100); return ok([ser(d) for d in ds])

@app.get("/api/admin/discounts")
async def admin_discounts(admin=Depends(get_admin)):
    ds=await db.discounts.find().to_list(100); return ok([ser(d) for d in ds])

@app.post("/api/admin/discounts",status_code=201)
async def create_discount(data:DiscountCreate,admin=Depends(get_admin)):
    did=str(uuid.uuid4()); doc={"_id":did,**data.dict()}
    await db.discounts.insert_one(doc); return ok(ser(doc),"Discount created")

@app.put("/api/admin/discounts/{did}")
async def update_discount(did:str,data:DiscountCreate,admin=Depends(get_admin)):
    res=await db.discounts.replace_one({"_id":did},{"_id":did,**data.dict()})
    if res.matched_count==0: raise HTTPException(404,"Discount not found")
    return ok(message="Discount updated")

@app.delete("/api/admin/discounts/{did}")
async def delete_discount(did:str,admin=Depends(get_admin)):
    await db.discounts.delete_one({"_id":did}); return ok(message="Discount deleted")

@app.post("/api/admin/seed",include_in_schema=False)
async def seed(secret:str):
    if secret!="HAPPYDRIVE_SEED_2025": raise HTTPException(403,"Invalid secret")
    if await db.users.find_one({"email":"admin@happydrive.com"}): return {"message":"Admin exists"}
    uid=str(uuid.uuid4())
    await db.users.insert_one({"_id":uid,"name":"Admin","email":"admin@happydrive.com",
        "password":hash_pw("Admin@123"),"is_admin":True,"created_at":datetime.utcnow().isoformat()})
    return {"message":"Admin seeded"}

@app.get("/api/health")
async def health(): return {"status":"ok","service":"HappyDrive API v4","razorpay":"enabled"}
