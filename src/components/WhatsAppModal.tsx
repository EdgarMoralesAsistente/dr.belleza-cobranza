import React, { useState, useEffect } from 'react';
import {
  X,
  MessageCircle,
  Copy,
  Check,
  Send,
  ExternalLink,
  Phone,
  Sparkles,
} from 'lucide-react';
import { Patient, Payment, Refund } from '../types';
import {
  WhatsAppTemplateType,
  WHATSAPP_TEMPLATES,
  generateWhatsAppMessage,
  openWhatsAppWeb,
  openWhatsAppMobile,
  cleanPhoneNumber,
} from '../services/whatsapp';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  payment?: Payment;
  refund?: Refund;
  initialTemplate?: WhatsAppTemplateType;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  isOpen,
  onClose,
  patient,
  payment,
  refund,
  initialTemplate = 'reminder',
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplateType>(initialTemplate);
  const [message, setMessage] = useState('');
  const [customPhone, setCustomPhone] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (patient) {
      setCustomPhone(patient.phone);
      const generated = generateWhatsAppMessage(selectedTemplate, patient, payment, refund);
      setMessage(generated);
    }
  }, [patient, payment, refund, selectedTemplate]);

  if (!isOpen || !patient) return null;

  const handleTemplateChange = (templateId: WhatsAppTemplateType) => {
    setSelectedTemplate(templateId);
    if (patient) {
      const generated = generateWhatsAppMessage(templateId, patient, payment, refund);
      setMessage(generated);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (e) {
      console.error('Error copying text', e);
    }
  };

  const handleSendWeb = () => {
    openWhatsAppWeb(customPhone, message);
  };

  const handleSendMobile = () => {
    openWhatsAppMobile(customPhone, message);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-emerald-600 text-white">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-700/80 flex items-center justify-center text-white">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">
                Notificación WhatsApp Web
              </h2>
              <p className="text-xs text-emerald-100">
                Dr. Jorge Apelencia • Envío directo a {patient.fullName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-100 hover:text-white hover:bg-emerald-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Patient Quick Info */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <p className="font-bold text-slate-900">{patient.fullName}</p>
              <p className="text-slate-500">{patient.procedure}</p>
            </div>
            <div className="text-right">
              <p className="text-slate-500">Saldo Pendiente:</p>
              <p className="font-bold text-amber-900 text-sm">
                ${patient.balance.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Template Selection Pills */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Seleccionar Plantilla de Mensaje
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {WHATSAPP_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => handleTemplateChange(tmpl.id)}
                  className={`p-2.5 text-left rounded-xl border transition-all ${
                    selectedTemplate === tmpl.id
                      ? 'border-emerald-600 bg-emerald-50/60 ring-1 ring-emerald-600'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <p className="text-xs font-bold text-slate-900">{tmpl.title}</p>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{tmpl.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Destination Phone */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span>Número de WhatsApp Destino</span>
              <span className="text-[11px] text-slate-400 font-normal">
                Limpio: {cleanPhoneNumber(customPhone)}
              </span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={customPhone}
                onChange={(e) => setCustomPhone(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Editable Text Area */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span>Mensaje (Editable antes de enviar)</span>
              <button
                onClick={handleCopy}
                className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 flex items-center space-x-1"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copiar texto</span>
                  </>
                )}
              </button>
            </label>
            <textarea
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 text-xs sm:text-sm font-sans bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 leading-relaxed"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={handleSendMobile}
              className="w-full sm:w-auto px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors flex items-center justify-center space-x-1.5"
              title="Abrir a través de WhatsApp App / Móvil"
            >
              <span>Abrir App Móvil</span>
            </button>

            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={handleSendWeb}
                className="px-5 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors flex items-center justify-center space-x-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Abrir WhatsApp Web</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
