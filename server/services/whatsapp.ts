import { db } from '../../database/db.ts';

export interface SendWhatsAppResult {
  sent: boolean;
  channel: 'meta_cloud' | 'simulation' | 'custom_webhook';
  message: string;
  whatsapp_web_url: string;
  error?: string;
}

export async function dispatchWhatsAppOtp(
  whatsappNumber: string,
  otpCode: string,
  purpose: string
): Promise<SendWhatsAppResult> {
  const cleanNumber = String(whatsappNumber).replace(/\D/g, '');
  const recipient = cleanNumber.startsWith('91') && cleanNumber.length === 12
    ? cleanNumber
    : `91${cleanNumber.slice(-10)}`;
  
  const purposeName =
    purpose === 'login'
      ? 'Login'
      : purpose === 'password_reset'
      ? 'Password Reset'
      : purpose === 'withdrawal'
      ? 'Withdrawal Authorization'
      : 'Account Registration';

  const textBody = `*RITAM REVIEW AGENCY*\nYour verification OTP for ${purposeName} is: *${otpCode}*\nValid for 5 minutes. Do not share this code with anyone.`;
  
  // Direct WhatsApp click-to-chat URL (wa.me)
  const whatsappWebUrl = `https://api.whatsapp.com/send?phone=${recipient}&text=${encodeURIComponent(textBody)}`;

  const config = db.getRawWhatsappConfig();

  // 1. Meta WhatsApp Cloud API (if configured and enabled)
  if (config.enabled && config.provider === 'meta_cloud' && config.meta_token && config.meta_phone_number_id) {
    try {
      const response = await fetch(`https://graph.facebook.com/v20.0/${config.meta_phone_number_id}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.meta_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: recipient,
          type: 'text',
          text: {
            preview_url: false,
            body: textBody
          }
        })
      });

      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        return {
          sent: true,
          channel: 'meta_cloud',
          message: `Live WhatsApp message dispatched to +${recipient} via Meta Cloud API.`,
          whatsapp_web_url: whatsappWebUrl
        };
      } else {
        return {
          sent: false,
          channel: 'simulation',
          message: `Meta API notice: ${data?.error?.message || 'Check recipient credentials'}. Falling back to on-screen OTP.`,
          whatsapp_web_url: whatsappWebUrl,
          error: data?.error?.message
        };
      }
    } catch (err: any) {
      return {
        sent: false,
        channel: 'simulation',
        message: 'Network issue contacting WhatsApp API. Falling back to on-screen OTP.',
        whatsapp_web_url: whatsappWebUrl,
        error: err.message
      };
    }
  }

  // 2. Custom Webhook Gateway (e.g. UltraMsg / Twilio proxy / local WhatsApp bot)
  if (config.enabled && config.provider === 'custom_webhook' && config.webhook_url) {
    try {
      const response = await fetch(config.webhook_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: recipient,
          otp: otpCode,
          purpose,
          text: textBody
        })
      });
      if (response.ok) {
        return {
          sent: true,
          channel: 'custom_webhook',
          message: `WhatsApp OTP dispatched to custom gateway for +${recipient}.`,
          whatsapp_web_url: whatsappWebUrl
        };
      }
    } catch {
      // Graceful fallback
    }
  }

  // 3. Simulation mode: Always returns code with wa.me link
  return {
    sent: true,
    channel: 'simulation',
    message: `Generated OTP ${otpCode} for +${recipient}. Ready for on-screen entry or direct WhatsApp launch.`,
    whatsapp_web_url: whatsappWebUrl
  };
}
