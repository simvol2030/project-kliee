/**
 * Notification services index
 */

export { sendEmail, sendOrderConfirmationEmail, sendAdminOrderNotification } from './email';
export { sendTelegramOrderNotification, sendTelegramTestMessage } from './telegram';

import { sendOrderConfirmationEmail, sendAdminOrderNotification } from './email';
import { sendTelegramOrderNotification } from './telegram';

interface OrderNotificationData {
	orderNumber: string;
	customerName: string;
	customerEmail: string;
	customerPhone?: string | null;
	items: Array<{
		title: string;
		price: number;
	}>;
	totalEur: number;
	totalLocal: number;
	currencyCode: string;
	shippingCountry: string;
	shippingCity: string;
	shippingAddress: string;
	note?: string | null;
	lang: string;
}

/**
 * Send all order notifications (email + telegram)
 * Non-blocking - errors are logged but don't fail the order
 */
export async function sendOrderNotifications(data: OrderNotificationData): Promise<{
	emailCustomer: boolean;
	emailAdmin: boolean;
	telegram: boolean;
}> {
	const results = {
		emailCustomer: false,
		emailAdmin: false,
		telegram: false
	};

	// Send all notifications in parallel
	try {
		const [emailCustomer, emailAdmin, telegram] = await Promise.all([
			sendOrderConfirmationEmail({
				orderNumber: data.orderNumber,
				customerName: data.customerName,
				customerEmail: data.customerEmail,
				items: data.items,
				totalEur: data.totalEur,
				totalLocal: data.totalLocal,
				currencyCode: data.currencyCode,
				shippingCountry: data.shippingCountry,
				shippingCity: data.shippingCity,
				lang: data.lang
			}).catch((err) => {
				console.error('Customer email failed:', err);
				return false;
			}),
			sendAdminOrderNotification({
				orderNumber: data.orderNumber,
				customerName: data.customerName,
				customerEmail: data.customerEmail,
				items: data.items,
				totalEur: data.totalEur,
				totalLocal: data.totalLocal,
				currencyCode: data.currencyCode,
				shippingCountry: data.shippingCountry,
				shippingCity: data.shippingCity,
				lang: data.lang
			}).catch((err) => {
				console.error('Admin email failed:', err);
				return false;
			}),
			sendTelegramOrderNotification({
				orderNumber: data.orderNumber,
				customerName: data.customerName,
				customerEmail: data.customerEmail,
				customerPhone: data.customerPhone,
				items: data.items,
				totalEur: data.totalEur,
				totalLocal: data.totalLocal,
				currencyCode: data.currencyCode,
				shippingCountry: data.shippingCountry,
				shippingCity: data.shippingCity,
				shippingAddress: data.shippingAddress,
				note: data.note
			}).catch((err) => {
				console.error('Telegram notification failed:', err);
				return false;
			})
		]);

		results.emailCustomer = emailCustomer;
		results.emailAdmin = emailAdmin;
		results.telegram = telegram;
	} catch (err) {
		console.error('Notification error:', err);
	}

	return results;
}
