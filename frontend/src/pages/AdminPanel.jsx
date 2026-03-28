import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminAPI, carsAPI, reviewsAPI } from '../utils/api';
import {
  BarChart2, Car, Users, Tag, BookOpen, Star,
  Plus, Pencil, Trash2, X, Check, Upload, Link as LinkIcon,
  ChevronDown, ChevronUp
} from 'lucide-react';

// ── Shared styles ─────────────────────────────────────────────────────────────
const inputCls = "w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent text-sm";
const labelCls = "block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5";

const statusStyles = {
  pending:   { cls: 'bg-yellow-600/20 text-yellow-400 border-yellow-600/40', label: 'Pending'   },
  confirmed: { cls: 'bg-green-600/20  text-green-400  border-green-600/40',  label: 'Confirmed' },
  rejected:  { cls: 'bg-red-600/20    text-red-400    border-red-600/40',    label: 'Rejected'  },
  cancelled: { cls: 'bg-gray-600/20   text-gray-400   border-gray-600/40',   label: 'Cancelled' },
};

// ── Analytics ─────────────────────────────────────────────────────────────────
const Analytics = () => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { adminAPI.getAnalytics().then(setData).finally(() => setLoading(false)); }, []);

  const stats = data ? [
    { icon:'👤', value: data.total_users,        label:'Total Users'        },
    { icon:'📋', value: data.total_bookings,      label:'Total Bookings'     },
    { icon:'🔥', value: data.active_bookings,     label:'Active Bookings'    },
    { icon:'⏳', value: data.pending_bookings,    label:'Pending'            },
    { icon:'❌', value: data.cancelled_bookings,  label:'Cancelled'          },
    { icon:'🚗', value: data.total_cars,          label:'Total Cars'         },
    { icon:'✅', value: data.available_cars,      label:'Available Cars'     },
    { icon:'💰', value:`₹${data.total_revenue?.toLocaleString()}`, label:'Revenue' },
    { icon:'⭐', value: data.total_reviews,       label:'Total Reviews'      },
  ] : [];

  if (loading) return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {[...Array(9)].map((_,i) => <div key={i} className="bg-white/5 border border-white/10 rounded-2xl h-32 animate-pulse" />)}
    </div>
  );
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {stats.map(({icon,value,label}) => (
        <div key={label} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center hover:border-red-600/40 transition-all duration-300">
          <div className="text-3xl mb-2">{icon}</div>
          <p className="text-3xl font-bold text-red-500 mb-1">{value}</p>
          <p className="text-gray-400 text-xs font-medium">{label}</p>
        </div>
      ))}
    </div>
  );
};

// ── Bookings ──────────────────────────────────────────────────────────────────
const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [actioning, setActioning] = useState('');

  useEffect(() => { adminAPI.getAllBookings().then(b => setBookings(Array.isArray(b) ? b : [])).finally(() => setLoading(false)); }, []);

  const handleAction = async (id, action) => {
    setActioning(id + action);
    try {
      await adminAPI.updateBooking(id, action);
      setBookings(prev => prev.map(b => b.id === id
        ? { ...b, status: action === 'confirm' ? 'confirmed' : 'rejected' } : b));
    } finally { setActioning(''); }
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              {['Booking ID','User','Car','Dates','Days','Total','Payment','Status','Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-gray-400 text-xs uppercase tracking-wider font-semibold whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? [...Array(4)].map((_,i) => (
              <tr key={i}>{[...Array(9)].map((_,j) => <td key={j} className="px-4 py-3"><div className="h-3 bg-white/10 rounded animate-pulse" /></td>)}</tr>
            )) : bookings.map(b => {
              const s = statusStyles[b.status] || statusStyles.pending;
              return (
                <tr key={b.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 font-mono text-red-500 text-xs">{b.id}</td>
                  <td className="px-4 py-3"><div className="font-medium text-white text-xs">{b.user_name}</div><div className="text-gray-500 text-xs">{b.user_email}</div></td>
                  <td className="px-4 py-3 text-gray-300 text-xs whitespace-nowrap">{b.car_name}</td>
                  <td className="px-4 py-3 text-xs"><div className="text-gray-300">{b.from_date}</div><div className="text-gray-500">{b.to_date}</div></td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{b.days}</td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-red-400 text-sm">₹{b.total_price?.toLocaleString()}</div>
                    {b.discount_percent > 0 && <div className="text-green-400 text-xs">−{b.discount_percent}%</div>}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <div className="text-gray-300 capitalize">{b.payment_method}</div>
                    <div className={`text-xs mt-0.5 ${b.payment_status === 'paid' ? 'text-green-400' : 'text-yellow-400'}`}>
                      {b.payment_status}
                    </div>
                  </td>
                  <td className="px-4 py-3"><span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${s.cls}`}>{s.label}</span></td>
                  <td className="px-4 py-3">
                    {b.status === 'pending' && (
                      <div className="flex gap-1.5">
                        <button onClick={() => handleAction(b.id,'confirm')} disabled={!!actioning}
                          className="bg-green-700 hover:bg-green-600 text-white px-2.5 py-1 rounded text-xs font-bold transition disabled:opacity-40">✓</button>
                        <button onClick={() => handleAction(b.id,'reject')} disabled={!!actioning}
                          className="bg-red-800 hover:bg-red-700 text-white px-2.5 py-1 rounded text-xs font-bold transition disabled:opacity-40">✗</button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!loading && bookings.length === 0 && <div className="text-center py-16 text-gray-500">No bookings yet.</div>}
      </div>
    </div>
  );
};

// ── Vehicles ──────────────────────────────────────────────────────────────────
const EMPTY_CAR = { name:'', brand:'', model:'', category:'Sedan', price_per_day:'', seats:'5', quantity:'1', fuel:'Petrol', transmission:'Automatic', image_url:'', description:'' };

const VehicleManagement = () => {
  const [cars, setCars]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId]   = useState(null);
  const [saving, setSaving]   = useState(false);
  const [formError, setFormError] = useState('');
  const [form, setForm]       = useState(EMPTY_CAR);
  const [imageMode, setImageMode] = useState('url'); // 'url' | 'upload'
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState('');
  const fileRef = useRef();

  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }));

  useEffect(() => { carsAPI.getAll().then(d => setCars(d?.cars || [])).finally(() => setLoading(false)); }, []);

  const openAdd = () => {
    setEditId(null); setForm(EMPTY_CAR); setFormError('');
    setUploadFile(null); setUploadPreview(''); setShowForm(true);
  };

  const openEdit = (car) => {
    setEditId(car.id);
    setForm({
      name: car.name || '', brand: car.brand || '', model: car.model || '',
      category: car.category || 'Sedan', price_per_day: car.price_per_day || '',
      seats: car.seats || '5', quantity: car.quantity || '1',
      fuel: car.fuel || 'Petrol', transmission: car.transmission || 'Automatic',
      image_url: car.image_url || '', description: car.description || '',
    });
    setFormError(''); setUploadFile(null); setUploadPreview(car.image_url || '');
    setImageMode(car.image_url ? 'url' : 'url');
    setShowForm(true);
  };

  const handleFileSelect = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploadFile(f);
    setUploadPreview(URL.createObjectURL(f));
  };

  const handleSave = async () => {
    if (!form.name || !form.price_per_day) { setFormError('Name and price are required.'); return; }
    setFormError(''); setSaving(true);
    try {
      const payload = {
        ...form,
        price_per_day: parseFloat(form.price_per_day),
        seats: parseInt(form.seats),
        quantity: parseInt(form.quantity) || 1,
      };

      let savedId = editId;
      if (editId) {
        await carsAPI.update(editId, payload);
      } else {
        const res = await carsAPI.create(payload);
        savedId = res?.id;
      }

      // Handle image upload if file was selected
      if (imageMode === 'upload' && uploadFile && savedId) {
        await carsAPI.uploadImage(savedId, uploadFile);
      }

      const refreshed = await carsAPI.getAll();
      setCars(refreshed?.cars || []);
      setShowForm(false); setEditId(null);
    } catch (e) {
      setFormError(e.response?.data?.detail || 'Failed to save vehicle.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this vehicle? This cannot be undone.')) return;
    await carsAPI.remove(id);
    setCars(prev => prev.filter(c => c.id !== id));
  };

  const handleToggle = async (car) => {
    await carsAPI.update(car.id, { available: !car.available });
    setCars(prev => prev.map(c => c.id === car.id ? { ...c, available: !c.available } : c));
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-end mb-6">
        <button onClick={openAdd}
          className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors">
          <Plus className="w-4 h-4" /> Add Vehicle
        </button>
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-8">
          <h3 className="text-xl font-bold text-white mb-6">{editId ? '✏️ Edit Vehicle' : '🚗 New Vehicle'}</h3>
          {formError && <div className="text-red-400 text-sm mb-4 bg-red-600/10 border border-red-600/20 rounded-lg px-4 py-3">⚠️ {formError}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              ['name',          'Vehicle Name *',      'text',  'e.g. Toyota Fortuner'],
              ['brand',         'Brand',               'text',  'e.g. Toyota'],
              ['model',         'Model',               'text',  'e.g. Fortuner 4x4'],
              ['price_per_day', 'Price / Day (₹) *',  'number','e.g. 3500'],
              ['seats',         'Seats',               'number','e.g. 5'],
              ['quantity',      'Quantity *',          'number','How many units'],
            ].map(([f,l,type,ph]) => (
              <div key={f}>
                <label className={labelCls}>{l}</label>
                <input type={type} min={type==='number'?'1':undefined}
                  className={inputCls} value={form[f]} onChange={set(f)} placeholder={ph} />
              </div>
            ))}

            <div>
              <label className={labelCls}>Category</label>
              <select className={inputCls} value={form.category} onChange={set('category')}>
                {['Sedan','SUV','Sports','Hatchback','Luxury','MUV'].map(c => <option key={c} className="bg-gray-900">{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Fuel Type</label>
              <select className={inputCls} value={form.fuel} onChange={set('fuel')}>
                {['Petrol','Diesel','Electric','Hybrid','CNG'].map(f => <option key={f} className="bg-gray-900">{f}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Transmission</label>
              <select className={inputCls} value={form.transmission} onChange={set('transmission')}>
                {['Automatic','Manual','PDK','CVT'].map(t => <option key={t} className="bg-gray-900">{t}</option>)}
              </select>
            </div>

            {/* Description — full width */}
            <div className="lg:col-span-3">
              <label className={labelCls}>Description</label>
              <textarea rows={2} className={inputCls} value={form.description}
                onChange={set('description')} placeholder="Brief description of the vehicle..." />
            </div>

            {/* Image — full width */}
            <div className="lg:col-span-3">
              <label className={labelCls}>Vehicle Image</label>
              <div className="flex gap-3 mb-3">
                <button type="button" onClick={() => setImageMode('url')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${imageMode==='url' ? 'bg-red-600 text-white' : 'bg-white/10 text-gray-400 hover:text-white'}`}>
                  <LinkIcon className="w-3.5 h-3.5" /> URL
                </button>
                <button type="button" onClick={() => setImageMode('upload')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${imageMode==='upload' ? 'bg-red-600 text-white' : 'bg-white/10 text-gray-400 hover:text-white'}`}>
                  <Upload className="w-3.5 h-3.5" /> Upload File
                </button>
              </div>

              {imageMode === 'url' ? (
                <input className={inputCls} value={form.image_url} onChange={set('image_url')}
                  placeholder="https://example.com/car.jpg" />
              ) : (
                <div>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                  <button type="button" onClick={() => fileRef.current?.click()}
                    className="w-full py-8 border-2 border-dashed border-white/20 rounded-lg text-gray-400 hover:border-red-600/50 hover:text-gray-300 transition-all text-sm flex flex-col items-center gap-2">
                    <Upload className="w-6 h-6" />
                    {uploadFile ? uploadFile.name : 'Click to upload image'}
                  </button>
                </div>
              )}

              {/* Preview */}
              {(uploadPreview || form.image_url) && (
                <div className="mt-3 relative w-32 h-20 rounded-lg overflow-hidden border border-white/10">
                  <img src={uploadPreview || form.image_url} alt="Preview"
                    className="w-full h-full object-cover"
                    onError={e => e.target.style.display='none'} />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs font-medium">Preview</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition disabled:opacity-50">
              <Check className="w-4 h-4" /> {saving ? 'Saving...' : editId ? 'Update Vehicle' : 'Add Vehicle'}
            </button>
            <button onClick={() => { setShowForm(false); setEditId(null); setFormError(''); }}
              className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition">
              <X className="w-4 h-4" /> Cancel
            </button>
          </div>
        </div>
      )}

      {/* Car Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(n => <div key={n} className="bg-white/5 border border-white/10 rounded-2xl h-72 animate-pulse" />)}
        </div>
      ) : cars.length === 0 ? (
        <div className="text-center py-16 text-gray-500 bg-white/5 border border-white/10 rounded-2xl">
          No vehicles yet. Add your first one above.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cars.map(car => (
            <div key={car.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-red-600/40 transition-all duration-300 group">
              <div className="relative h-44 bg-white/5">
                {car.image_url ? (
                  <img src={car.image_url} alt={car.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600 text-sm">No image</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-1">
                  <div className="font-bold text-white text-lg leading-tight">{car.name}</div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ml-2 ${car.available ? 'bg-green-600/20 text-green-400 border-green-600/40' : 'bg-gray-700/30 text-gray-500 border-gray-600/40'}`}>
                    {car.available ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="text-gray-400 text-sm mb-1">{car.brand} · {car.category}</div>
                <div className="flex gap-4 text-xs text-gray-500 mb-3">
                  <span>₹{(car.price_per_day||0).toLocaleString()}/day</span>
                  <span>·</span>
                  <span>{car.seats} seats</span>
                  <span>·</span>
                  <span>Qty: {car.quantity || 1}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(car)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition text-xs font-medium">
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button onClick={() => handleToggle(car)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white/10 text-gray-300 rounded-lg hover:bg-white/20 transition text-xs font-medium">
                    {car.available ? '⏸ Deactivate' : '▶ Activate'}
                  </button>
                  <button onClick={() => handleDelete(car.id)}
                    className="py-2 px-3 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Discounts ─────────────────────────────────────────────────────────────────
const EMPTY_DISC = { name:'', description:'', type:'promotional', discount_percent:'', promo_code:'', min_days:'', season_start:'', season_end:'', active:true };

const DiscountManagement = () => {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editId, setEditId]       = useState(null);
  const [saving, setSaving]       = useState(false);
  const [formError, setFormError] = useState('');
  const [form, setForm]           = useState(EMPTY_DISC);
  const set  = f => e => setForm(p => ({ ...p, [f]: e.target.value }));
  const setChk = f => e => setForm(p => ({ ...p, [f]: e.target.checked }));

  useEffect(() => { adminAPI.getDiscounts().then(d => setDiscounts(Array.isArray(d) ? d : [])).finally(() => setLoading(false)); }, []);

  const openAdd  = () => { setEditId(null); setForm(EMPTY_DISC); setFormError(''); setShowForm(true); };
  const openEdit = d => {
    setEditId(d.id);
    setForm({ name:d.name||'', description:d.description||'', type:d.type||'promotional',
      discount_percent:d.discount_percent||'', promo_code:d.promo_code||'',
      min_days:d.min_days||'', season_start:d.season_start||'', season_end:d.season_end||'',
      active:d.active!==false });
    setFormError(''); setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.discount_percent) { setFormError('Name and discount % are required.'); return; }
    if (form.type==='promotional' && !form.promo_code) { setFormError('Promo code required.'); return; }
    if (form.type==='long_term'   && !form.min_days)   { setFormError('Min days required.'); return; }
    if (form.type==='seasonal' && (!form.season_start||!form.season_end)) { setFormError('Season dates required.'); return; }
    setFormError(''); setSaving(true);
    try {
      const payload = { ...form, discount_percent: parseFloat(form.discount_percent), min_days: form.min_days ? parseInt(form.min_days) : null };
      if (editId) {
        await adminAPI.updateDiscount(editId, payload);
        setDiscounts(prev => prev.map(d => d.id===editId ? { ...d, ...payload, id:editId } : d));
      } else {
        const created = await adminAPI.createDiscount(payload);
        setDiscounts(prev => [...prev, created || { ...payload, id: Date.now().toString() }]);
      }
      setShowForm(false); setEditId(null);
    } catch(e) { setFormError(e.response?.data?.detail || 'Failed to save.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this discount?')) return;
    await adminAPI.deleteDiscount(id);
    setDiscounts(prev => prev.filter(d => d.id!==id));
  };

  const handleToggle = async d => {
    await adminAPI.updateDiscount(d.id, { ...d, active: !d.active });
    setDiscounts(prev => prev.map(x => x.id===d.id ? { ...x, active:!d.active } : x));
  };

  return (
    <div>
      <div className="flex justify-end mb-6">
        <button onClick={openAdd}
          className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors">
          <Plus className="w-4 h-4" /> Add Discount
        </button>
      </div>

      {showForm && (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-8">
          <h3 className="text-xl font-bold text-white mb-6">{editId ? '✏️ Edit Discount' : '🏷 New Discount'}</h3>
          {formError && <div className="text-red-400 text-sm mb-4 bg-red-600/10 border border-red-600/20 rounded-lg px-4 py-3">⚠️ {formError}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div><label className={labelCls}>Coupon Name *</label><input className={inputCls} value={form.name} onChange={set('name')} placeholder="e.g. Summer Sale" /></div>
            <div><label className={labelCls}>Discount % *</label><input type="number" min="1" max="100" className={inputCls} value={form.discount_percent} onChange={set('discount_percent')} placeholder="e.g. 20" /></div>
            <div><label className={labelCls}>Type *</label>
              <select className={inputCls} value={form.type} onChange={set('type')}>
                <option value="promotional" className="bg-gray-900">Promotional (Promo Code)</option>
                <option value="long_term"   className="bg-gray-900">Long Term (Min Days)</option>
                <option value="seasonal"    className="bg-gray-900">Seasonal (Date Range)</option>
              </select>
            </div>
            {form.type==='promotional' && <div><label className={labelCls}>Promo Code *</label><input className={inputCls} value={form.promo_code} onChange={set('promo_code')} placeholder="e.g. HAPPY20" style={{textTransform:'uppercase'}} /></div>}
            {form.type==='long_term'   && <div><label className={labelCls}>Min Days *</label><input type="number" min="1" className={inputCls} value={form.min_days} onChange={set('min_days')} placeholder="e.g. 7" /></div>}
            {form.type==='seasonal'    && <>
              <div><label className={labelCls}>Season Start *</label><input type="date" className={inputCls} value={form.season_start} onChange={set('season_start')} /></div>
              <div><label className={labelCls}>Season End *</label><input type="date" className={inputCls} value={form.season_end} onChange={set('season_end')} /></div>
            </>}
            <div className="md:col-span-2"><label className={labelCls}>Description</label><input className={inputCls} value={form.description} onChange={set('description')} placeholder="Optional" /></div>
            <div className="flex items-center gap-3 pt-6">
              <input type="checkbox" id="disc-active" checked={form.active} onChange={setChk('active')} className="w-4 h-4 accent-red-600" />
              <label htmlFor="disc-active" className="text-sm text-gray-300 font-medium">Active immediately</label>
            </div>
          </div>
          <div className="flex gap-4 mt-6">
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition disabled:opacity-50">
              <Check className="w-4 h-4" />{saving ? 'Saving...' : editId ? 'Update' : 'Create Discount'}
            </button>
            <button onClick={() => { setShowForm(false); setEditId(null); }}
              className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition">
              <X className="w-4 h-4" />Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                {['Name','Type','Rule','Discount %','Status','Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-gray-400 text-xs uppercase tracking-wider font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? [...Array(3)].map((_,i) => (
                <tr key={i}>{[...Array(6)].map((_,j) => <td key={j} className="px-5 py-4"><div className="h-3 bg-white/10 rounded animate-pulse" /></td>)}</tr>
              )) : discounts.map(d => (
                <tr key={d.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-5 py-4"><div className="font-semibold text-white">{d.name}</div>{d.description && <div className="text-gray-500 text-xs">{d.description}</div>}</td>
                  <td className="px-5 py-4"><span className="bg-white/10 text-gray-300 px-2.5 py-1 rounded-full text-xs capitalize">{d.type?.replace('_',' ')}</span></td>
                  <td className="px-5 py-4 text-xs text-gray-400">
                    {d.type==='long_term'   && `${d.min_days}+ days`}
                    {d.type==='seasonal'    && `${d.season_start} – ${d.season_end}`}
                    {d.type==='promotional' && <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-yellow-400">{d.promo_code}</span>}
                  </td>
                  <td className="px-5 py-4 font-bold text-green-400">{d.discount_percent}%</td>
                  <td className="px-5 py-4">
                    <button onClick={() => handleToggle(d)}
                      className={`text-xs font-bold px-2.5 py-1 rounded-full border transition-all ${d.active ? 'bg-green-600/20 text-green-400 border-green-600/40 hover:bg-red-600/10 hover:text-red-400 hover:border-red-600/40' : 'bg-gray-700/30 text-gray-400 border-gray-600/40 hover:bg-green-600/10 hover:text-green-400 hover:border-green-600/40'}`}>
                      {d.active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-3 items-center">
                      <button onClick={() => openEdit(d)} className="text-blue-400 hover:text-blue-300 transition"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(d.id)} className="text-red-400 hover:text-red-300 transition"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && discounts.length===0 && <div className="text-center py-16 text-gray-500">No discounts yet. Add one above.</div>}
        </div>
      </div>
    </div>
  );
};

// ── Users ─────────────────────────────────────────────────────────────────────
const EMPTY_USER = { name:'', email:'', password:'', phone:'', is_admin:false };

const UserManagement = () => {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId]   = useState(null);
  const [saving, setSaving]   = useState(false);
  const [formError, setFormError] = useState('');
  const [form, setForm]       = useState(EMPTY_USER);
  const [expandedUser, setExpandedUser] = useState(null);
  const [userDetail, setUserDetail]     = useState({});
  const set    = f => e => setForm(p => ({ ...p, [f]: e.target.value }));
  const setChk = f => e => setForm(p => ({ ...p, [f]: e.target.checked }));

  useEffect(() => { adminAPI.getUsers().then(u => setUsers(Array.isArray(u) ? u : [])).finally(() => setLoading(false)); }, []);

  const openAdd  = () => { setEditId(null); setForm(EMPTY_USER); setFormError(''); setShowForm(true); };
  const openEdit = u => {
    setEditId(u.id);
    setForm({ name:u.name||'', email:u.email||'', password:'', phone:u.phone||'', is_admin:u.is_admin||false });
    setFormError(''); setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.email) { setFormError('Name and email are required.'); return; }
    if (!editId && !form.password) { setFormError('Password required for new user.'); return; }
    setFormError(''); setSaving(true);
    try {
      const payload = { ...form };
      if (editId && !payload.password) delete payload.password;
      if (editId) {
        await adminAPI.updateUser(editId, payload);
        setUsers(prev => prev.map(u => u.id===editId ? { ...u, ...payload } : u));
      } else {
        const res = await adminAPI.createUser(payload);
        const refreshed = await adminAPI.getUsers();
        setUsers(Array.isArray(refreshed) ? refreshed : []);
      }
      setShowForm(false); setEditId(null);
    } catch(e) { setFormError(e.response?.data?.detail || 'Failed to save user.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this user? All their data will be removed.')) return;
    await adminAPI.deleteUser(id);
    setUsers(prev => prev.filter(u => u.id!==id));
  };

  const toggleExpand = async id => {
    if (expandedUser===id) { setExpandedUser(null); return; }
    setExpandedUser(id);
    if (!userDetail[id]) {
      try {
        const detail = await adminAPI.getUser(id);
        setUserDetail(p => ({ ...p, [id]: detail }));
      } catch {}
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-6">
        <button onClick={openAdd}
          className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors">
          <Plus className="w-4 h-4" /> Add User
        </button>
      </div>

      {showForm && (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-8">
          <h3 className="text-xl font-bold text-white mb-6">{editId ? '✏️ Edit User' : '👤 New User'}</h3>
          {formError && <div className="text-red-400 text-sm mb-4 bg-red-600/10 border border-red-600/20 rounded-lg px-4 py-3">⚠️ {formError}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div><label className={labelCls}>Full Name *</label><input className={inputCls} value={form.name} onChange={set('name')} placeholder="John Doe" /></div>
            <div><label className={labelCls}>Email *</label><input type="email" className={inputCls} value={form.email} onChange={set('email')} placeholder="user@example.com" /></div>
            <div><label className={labelCls}>Phone</label><input type="tel" className={inputCls} value={form.phone} onChange={set('phone')} placeholder="+91 ..." /></div>
            <div><label className={labelCls}>{editId ? 'New Password (leave blank to keep)' : 'Password *'}</label><input type="password" className={inputCls} value={form.password} onChange={set('password')} placeholder={editId ? 'Leave blank to keep current' : 'Min 6 characters'} /></div>
            <div className="flex items-center gap-3 mt-2">
              <input type="checkbox" id="is-admin" checked={form.is_admin} onChange={setChk('is_admin')} className="w-4 h-4 accent-red-600" />
              <label htmlFor="is-admin" className="text-sm text-gray-300 font-medium">Admin User</label>
            </div>
          </div>
          <div className="flex gap-4 mt-6">
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition disabled:opacity-50">
              <Check className="w-4 h-4" />{saving ? 'Saving...' : editId ? 'Update User' : 'Create User'}
            </button>
            <button onClick={() => { setShowForm(false); setEditId(null); }}
              className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition">
              <X className="w-4 h-4" />Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                {['User','Email','Phone','Role','Joined','Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-gray-400 text-xs uppercase tracking-wider font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? [...Array(4)].map((_,i) => (
                <tr key={i}>{[...Array(6)].map((_,j) => <td key={j} className="px-5 py-4"><div className="h-3 bg-white/10 rounded animate-pulse" /></td>)}</tr>
              )) : users.map(u => (
                <React.Fragment key={u.id}>
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-red-600/20 rounded-full flex items-center justify-center text-red-400 font-bold text-sm flex-shrink-0">
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-white">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-400 text-xs">{u.email}</td>
                    <td className="px-5 py-4 text-gray-400 text-xs">{u.phone || '—'}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${u.is_admin ? 'bg-red-600/20 text-red-400 border-red-600/40' : 'bg-blue-600/20 text-blue-400 border-blue-600/40'}`}>
                        {u.is_admin ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-500 text-xs">{u.created_at?.split('T')[0]}</td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2 items-center">
                        <button onClick={() => toggleExpand(u.id)}
                          className="text-gray-400 hover:text-white transition" title="View bookings">
                          {expandedUser===u.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        <button onClick={() => openEdit(u)} className="text-blue-400 hover:text-blue-300 transition"><Pencil className="w-4 h-4" /></button>
                        {!u.is_admin && <button onClick={() => handleDelete(u.id)} className="text-red-400 hover:text-red-300 transition"><Trash2 className="w-4 h-4" /></button>}
                      </div>
                    </td>
                  </tr>
                  {expandedUser===u.id && (
                    <tr>
                      <td colSpan={6} className="px-5 py-4 bg-white/5">
                        {userDetail[u.id] ? (
                          userDetail[u.id].bookings?.length > 0 ? (
                            <div className="space-y-2">
                              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Booking History</p>
                              {userDetail[u.id].bookings.map(b => (
                                <div key={b.id} className="flex items-center justify-between text-xs bg-white/5 rounded-lg px-4 py-2.5">
                                  <span className="font-mono text-red-400">{b.id}</span>
                                  <span className="text-gray-300">{b.car_name}</span>
                                  <span className="text-gray-500">{b.from_date} → {b.to_date}</span>
                                  <span className="font-bold text-red-400">₹{b.total_price?.toLocaleString()}</span>
                                  <span className={`px-2 py-0.5 rounded-full border text-xs font-bold ${statusStyles[b.status]?.cls || statusStyles.pending.cls}`}>
                                    {statusStyles[b.status]?.label || b.status}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500 text-sm">No bookings yet.</p>
                          )
                        ) : (
                          <p className="text-gray-500 text-sm animate-pulse">Loading booking history...</p>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          {!loading && users.length===0 && <div className="text-center py-16 text-gray-500">No users yet.</div>}
        </div>
      </div>
    </div>
  );
};

// ── Reviews ───────────────────────────────────────────────────────────────────
const ReviewManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { adminAPI.getReviews().then(r => setReviews(Array.isArray(r) ? r : [])).finally(() => setLoading(false)); }, []);

  const handleDelete = async id => {
    if (!window.confirm('Delete this review?')) return;
    await adminAPI.deleteReview(id);
    setReviews(prev => prev.filter(r => r.id!==id));
  };

  const Stars = ({ n }) => (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`w-3.5 h-3.5 ${i<=n ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}`} />
      ))}
    </div>
  );

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              {['User','Vehicle','Rating','Comment','Date','Action'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-gray-400 text-xs uppercase tracking-wider font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? [...Array(4)].map((_,i) => (
              <tr key={i}>{[...Array(6)].map((_,j) => <td key={j} className="px-5 py-4"><div className="h-3 bg-white/10 rounded animate-pulse" /></td>)}</tr>
            )) : reviews.map(r => (
              <tr key={r.id} className="hover:bg-white/5 transition-colors">
                <td className="px-5 py-4 font-medium text-white text-xs">{r.user_name}</td>
                <td className="px-5 py-4 text-gray-400 text-xs font-mono">{r.vehicle_id?.slice(0,8)}…</td>
                <td className="px-5 py-4"><Stars n={r.rating} /></td>
                <td className="px-5 py-4 text-gray-400 text-xs max-w-xs truncate">{r.comment || '—'}</td>
                <td className="px-5 py-4 text-gray-500 text-xs">{r.created_at?.split('T')[0]}</td>
                <td className="px-5 py-4">
                  <button onClick={() => handleDelete(r.id)} className="text-red-400 hover:text-red-300 transition"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && reviews.length===0 && <div className="text-center py-16 text-gray-500">No reviews yet.</div>}
      </div>
    </div>
  );
};

// ── Main AdminPanel ───────────────────────────────────────────────────────────
const AdminPanel = () => {
  const { logout } = useAuth();
  const navigate   = useNavigate();
  const [activeTab, setActiveTab] = useState('analytics');

  const tabs = [
    { id:'analytics', label:'📊 Analytics', icon: BarChart2 },
    { id:'bookings',  label:'📋 Bookings',  icon: BookOpen  },
    { id:'vehicles',  label:'🚗 Vehicles',  icon: Car       },
    { id:'users',     label:'👥 Users',     icon: Users     },
    { id:'discounts', label:'🏷 Discounts', icon: Tag       },
    { id:'reviews',   label:'⭐ Reviews',   icon: Star      },
  ];

  return (
    <div className="min-h-screen bg-black pt-20">
      <section className="relative py-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                Admin <span className="text-red-600">Panel</span>
              </h1>
              <p className="text-gray-400">Manage your fleet, bookings, users and more</p>
            </div>
            <button onClick={() => { logout(); navigate('/'); }}
              className="px-5 py-2.5 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition text-sm font-medium">
              Logout
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-300 text-sm ${activeTab===tab.id ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab==='analytics' && <Analytics />}
        {activeTab==='bookings'  && <BookingManagement />}
        {activeTab==='vehicles'  && <VehicleManagement />}
        {activeTab==='users'     && <UserManagement />}
        {activeTab==='discounts' && <DiscountManagement />}
        {activeTab==='reviews'   && <ReviewManagement />}
      </div>
    </div>
  );
};

export default AdminPanel;
