import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Stethoscope,
  DollarSign,
  Calendar,
  FileText,
  Tag,
  AlertCircle,
  Check,
  Percent,
} from 'lucide-react';
import { Patient, SurgicalProcedure } from '../types';

interface EditPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  onSavePatient: (updatedPatient: Patient) => void;
  availableProcedures?: SurgicalProcedure[];
}

export const EditPatientModal: React.FC<EditPatientModalProps> = ({
  isOpen,
  onClose,
  patient,
  onSavePatient,
  availableProcedures = [],
}) => {
  const [fullName, setFullName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [campaign, setCampaign] = useState('');
  const [procedure, setProcedure] = useState('');
  const [doctor, setDoctor] = useState('Dr. Jorge Apelencia');
  const [totalCost, setTotalCost] = useState<number | ''>('');
  const [totalPaid, setTotalPaid] = useState<number>(0);
  const [status, setStatus] = useState<'pending' | 'paid' | 'overdue'>('pending');
  const [nextPaymentDate, setNextPaymentDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (patient) {
      setFullName(patient.fullName || '');
      setIdNumber(patient.idNumber || '');
      setPhone(patient.phone || '');
      setEmail(patient.email || '');
      setCity(patient.city || '');
      setCampaign(patient.campaign || 'Instagram Ads');
      setProcedure(patient.procedure || '');
      setDoctor(patient.doctor || 'Dr. Jorge Apelencia');
      setTotalCost(patient.totalCost ?? '');
      setTotalPaid(patient.totalPaid ?? 0);
      setStatus(patient.status || 'pending');
      setNextPaymentDate(patient.nextPaymentDate || '');
      setNotes(patient.notes || '');
    }
  }, [patient, isOpen]);

  if (!isOpen || !patient) return null;

  const numericCost = totalCost === '' ? 0 : Number(totalCost);
  const calculatedBalance = Math.max(0, numericCost - totalPaid);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !phone.trim() || !procedure.trim() || totalCost === '') {
      alert('Por favor complete los campos obligatorios (Nombre, Teléfono, Procedimiento y Costo Total).');
      return;
    }

    const updatedPatient: Patient = {
      ...patient,
      fullName: fullName.trim(),
      idNumber: idNumber.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      city: city.trim() || undefined,
      campaign: campaign.trim() || undefined,
      procedure: procedure.trim(),
      doctor: doctor.trim() || 'Dr. Jorge Apelencia',
      totalCost: numericCost,
      totalPaid: totalPaid,
      balance: calculatedBalance,
      status: calculatedBalance === 0 ? 'paid' : status,
      nextPaymentDate: nextPaymentDate || undefined,
      notes: notes.trim() || undefined,
    };

    onSavePatient(updatedPatient);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-slate-900">
                  Editar Paciente
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  {patient.id}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Actualice los datos personales, clínicos y el estado de cobranza
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
          {/* Sección 1: Datos Personales */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Datos Personales & Contacto</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nombre Completo <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ej. Sofía Martínez"
                  className="w-full py-2 px-3 rounded-lg bg-slate-50 border border-slate-300 font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  DNI / Cédula / RUT <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  placeholder="Ej. 38.452.119"
                  className="w-full py-2 px-3 rounded-lg bg-slate-50 border border-slate-300 text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  WhatsApp / Teléfono <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+54 9 11 4567 8901"
                    className="w-full pl-8 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sofia@ejemplo.com"
                    className="w-full pl-8 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Ciudad de Residencia
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ej. Buenos Aires, Rosario, etc."
                    className="w-full pl-8 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Origen / Campaña de Marketing
                </label>
                <select
                  value={campaign}
                  onChange={(e) => setCampaign(e.target.value)}
                  className="w-full py-2 px-3 rounded-lg bg-slate-50 border border-slate-300 text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="Instagram Ads">Instagram Ads</option>
                  <option value="Google Ads">Google Ads</option>
                  <option value="TikTok">TikTok</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Recomendación / Boca en boca">Recomendación / Boca en boca</option>
                  <option value="Paciente Recurrente">Paciente Recurrente</option>
                  <option value="Otro">Otro Canal</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sección 2: Procedimiento & Médico */}
          <div className="pt-3 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
              <span>Tratamiento Quirúrgico / Estético</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Procedimiento(s) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  list="edit-procedure-suggestions"
                  value={procedure}
                  onChange={(e) => setProcedure(e.target.value)}
                  placeholder="Ej. Rinoplastia Ultrasónica + Mentoplastia"
                  className="w-full py-2 px-3 rounded-lg bg-slate-50 border border-slate-300 font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
                <datalist id="edit-procedure-suggestions">
                  {availableProcedures.filter((p) => p.isActive).map((p) => (
                    <option key={p.id} value={p.name} />
                  ))}
                </datalist>
                {availableProcedures.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                    <span className="text-[10px] text-slate-400">Catálogo:</span>
                    {availableProcedures.filter((p) => p.isActive).map((p) => (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => setProcedure(p.name)}
                        className={`text-[10px] px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                          procedure === p.name
                            ? 'bg-emerald-100 text-emerald-800 font-bold border border-emerald-300'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Médico Responsable
                </label>
                <input
                  type="text"
                  value={doctor}
                  onChange={(e) => setDoctor(e.target.value)}
                  className="w-full py-2 px-3 rounded-lg bg-slate-50 border border-slate-300 text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Sección 3: Finanzas & Cobranza */}
          <div className="pt-3 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-1.5">
              <DollarSign className="w-3.5 h-3.5 text-slate-400" />
              <span>Condiciones Financieras & Saldo</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Costo Total (USD) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={totalCost}
                    onChange={(e) => setTotalCost(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-300 font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-500 mb-1">
                  Total Abonado
                </label>
                <div className="py-2 px-3 rounded-lg bg-slate-100 border border-slate-200 font-bold text-emerald-700">
                  ${totalPaid.toLocaleString()} USD
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Saldo Pendiente
                </label>
                <div className={`py-2 px-3 rounded-lg border font-bold ${
                  calculatedBalance === 0
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}>
                  ${calculatedBalance.toLocaleString()} USD
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Estado de Cuenta
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'pending' | 'paid' | 'overdue')}
                  className="w-full py-2 px-3 rounded-lg bg-slate-50 border border-slate-300 font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="pending">🟡 Pendiente (Con saldo en proceso)</option>
                  <option value="paid">🟢 Cancelado / Al Día (Totalmente pagado)</option>
                  <option value="overdue">🔴 Vencido (Mora en cuota acordada)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Próxima Fecha de Pago
                </label>
                <input
                  type="date"
                  value={nextPaymentDate}
                  onChange={(e) => setNextPaymentDate(e.target.value)}
                  className="w-full py-2 px-3 rounded-lg bg-slate-50 border border-slate-300 text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Sección 4: Notas */}
          <div className="pt-3 border-t border-slate-100">
            <label className="block font-medium text-slate-700 mb-1 flex items-center space-x-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Notas Clínicas / Observaciones de Cobranza</span>
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anotaciones importantes sobre acuerdos de pago, fechas de quirófano o preferencias..."
              className="w-full py-2 px-3 rounded-lg bg-slate-50 border border-slate-300 text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 font-semibold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 font-bold transition-colors shadow-2xs cursor-pointer flex items-center space-x-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Guardar Cambios</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
