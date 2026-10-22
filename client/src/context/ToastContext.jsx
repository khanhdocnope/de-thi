import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  X, 
  HelpCircle 
} from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [modalConfig, setModalConfig] = useState(null); // { title, message, confirmText, cancelText, type, isAlert, resolve }
  const toastIdRef = useRef(0);

  // Add toast
  const addToast = useCallback((message, type = 'info', title = null) => {
    const id = ++toastIdRef.current;
    setToasts(prev => [...prev, { id, message, type, title }]);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Shortcut toast methods
  const toast = {
    success: (msg, title) => addToast(msg, 'success', title),
    error: (msg, title) => addToast(msg, 'error', title),
    info: (msg, title) => addToast(msg, 'info', title),
    warning: (msg, title) => addToast(msg, 'warning', title),
  };

  // Custom confirm dialog that returns a Promise<boolean>
  const confirm = useCallback((options) => {
    const {
      title = 'Xác nhận thao tác',
      message,
      confirmText = 'Xác nhận',
      cancelText = 'Hủy bỏ',
      type = 'warning' // 'warning', 'danger', 'info'
    } = typeof options === 'string' ? { message: options } : options;

    return new Promise((resolve) => {
      setModalConfig({
        title,
        message,
        confirmText,
        cancelText,
        type,
        isAlert: false,
        resolve
      });
    });
  }, []);

  // Custom alert dialog that returns a Promise<void>
  const alertCustom = useCallback((options) => {
    const {
      title = 'Thông báo',
      message,
      confirmText = 'Đã hiểu',
      type = 'info'
    } = typeof options === 'string' ? { message: options } : options;

    return new Promise((resolve) => {
      setModalConfig({
        title,
        message,
        confirmText,
        type,
        isAlert: true,
        resolve
      });
    });
  }, []);

  const handleModalClose = (result) => {
    if (modalConfig && modalConfig.resolve) {
      modalConfig.resolve(result);
    }
    setModalConfig(null);
  };

  return (
    <ToastContext.Provider value={{ toast, confirm, alert: alertCustom }}>
      {children}

      {/* Floating Toast Notification Container */}
      <div 
        style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          pointerEvents: 'none',
          maxWidth: '420px',
          width: 'calc(100% - 48px)'
        }}
      >
        {toasts.map(t => {
          let icon = <Info size={20} color="#2563EB" />;
          let bg = '#EFF6FF';
          let border = '#BFDBFE';
          let titleColor = '#1D4ED8';

          if (t.type === 'success') {
            icon = <CheckCircle2 size={20} color="#10B981" />;
            bg = '#F0FDF4';
            border = '#BBF7D0';
            titleColor = '#15803D';
          } else if (t.type === 'error') {
            icon = <AlertCircle size={20} color="#EF4444" />;
            bg = '#FEF2F2';
            border = '#FECACA';
            titleColor = '#B91C1C';
          } else if (t.type === 'warning') {
            icon = <AlertTriangle size={20} color="#F59E0B" />;
            bg = '#FFFBEB';
            border = '#FDE68A';
            titleColor = '#B45309';
          }

          return (
            <div
              key={t.id}
              className="toast-item"
              style={{
                pointerEvents: 'auto',
                background: bg,
                border: `1px solid ${border}`,
                borderRadius: '12px',
                padding: '14px 18px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '14px',
                animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                backdropFilter: 'blur(8px)'
              }}
            >
              <div style={{ flexShrink: 0, marginTop: '2px' }}>
                {icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                {t.title && (
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: titleColor, marginBottom: '2px' }}>
                    {t.title}
                  </div>
                )}
                <div style={{ fontSize: '0.875rem', color: '#1E293B', lineHeight: '1.5', wordBreak: 'break-word' }}>
                  {t.message}
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeToast(t.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '4px'
                }}
                title="Đóng thông báo"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Custom Confirmation / Alert Modal Dialog */}
      {modalConfig && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px',
            animation: 'fadeIn 0.2s ease-out'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !modalConfig.isAlert) {
              handleModalClose(false);
            }
          }}
        >
          <div 
            style={{
              background: 'white',
              borderRadius: '20px',
              maxWidth: '460px',
              width: '100%',
              padding: '28px 24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #E2E8F0',
              animation: 'scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              textAlign: 'center'
            }}
          >
            {/* Modal Icon Badge */}
            <div 
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                margin: '0 auto 16px auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: modalConfig.type === 'danger' 
                  ? '#FEE2E2' 
                  : modalConfig.type === 'success'
                  ? '#DCFCE7'
                  : modalConfig.type === 'warning'
                  ? '#FEF3C7'
                  : '#DBEAFE',
                color: modalConfig.type === 'danger'
                  ? '#EF4444'
                  : modalConfig.type === 'success'
                  ? '#10B981'
                  : modalConfig.type === 'warning'
                  ? '#F59E0B'
                  : '#2563EB'
              }}
            >
              {modalConfig.type === 'danger' ? (
                <AlertCircle size={32} />
              ) : modalConfig.type === 'success' ? (
                <CheckCircle2 size={32} />
              ) : modalConfig.type === 'warning' ? (
                <AlertTriangle size={32} />
              ) : (
                <HelpCircle size={32} />
              )}
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginBottom: '10px' }}>
              {modalConfig.title}
            </h3>

            <p style={{ color: '#475569', fontSize: '0.925rem', lineHeight: '1.6', marginBottom: '24px' }}>
              {modalConfig.message}
            </p>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              {!modalConfig.isAlert && (
                <button
                  type="button"
                  onClick={() => handleModalClose(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '10px 16px', fontWeight: 600 }}
                >
                  {modalConfig.cancelText}
                </button>
              )}
              <button
                type="button"
                onClick={() => handleModalClose(true)}
                className={`btn ${
                  modalConfig.type === 'danger' 
                    ? 'btn-danger' 
                    : modalConfig.type === 'success' 
                    ? 'btn-success' 
                    : 'btn-primary'
                }`}
                style={{ 
                  flex: 1, 
                  padding: '10px 16px', 
                  fontWeight: 700,
                  background: modalConfig.type === 'danger' ? '#EF4444' : undefined,
                  borderColor: modalConfig.type === 'danger' ? '#EF4444' : undefined,
                  color: 'white'
                }}
              >
                {modalConfig.confirmText}
              </button>
            </div>

          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
