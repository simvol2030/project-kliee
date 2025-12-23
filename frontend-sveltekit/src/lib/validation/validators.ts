import { z, type ZodSchema } from 'zod';

export interface ValidationResult<T> {
	success: boolean;
	data?: T;
	errors?: Record<string, string>;
	flatErrors?: string[];
}

/**
 * Validate data against a Zod schema
 */
export function validate<T>(schema: ZodSchema<T>, data: unknown): ValidationResult<T> {
	try {
		const validData = schema.parse(data);
		return { success: true, data: validData };
	} catch (error) {
		if (error instanceof z.ZodError) {
			return {
				success: false,
				errors: formatZodErrors(error),
				flatErrors: error.issues.map((e) => e.message)
			};
		}
		throw error;
	}
}

/**
 * Validate FormData against a Zod schema
 */
export function validateFormData<T>(
	schema: ZodSchema<T>,
	formData: FormData
): ValidationResult<T> {
	const data = formDataToObject(formData);
	return validate(schema, data);
}

/**
 * Convert FormData to a plain object with proper type coercion
 */
export function formDataToObject(formData: FormData): Record<string, unknown> {
	const obj: Record<string, unknown> = {};

	formData.forEach((value, key) => {
		// Handle checkboxes (only present when checked)
		if (value === 'on') {
			obj[key] = true;
			return;
		}

		// Handle empty strings
		if (value === '') {
			obj[key] = null;
			return;
		}

		// Handle numbers
		const num = Number(value);
		if (!isNaN(num) && value !== '' && /^-?\d+(\.\d+)?$/.test(value.toString())) {
			obj[key] = num;
			return;
		}

		// Handle JSON strings
		if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
			try {
				obj[key] = JSON.parse(value);
				return;
			} catch {
				// Not valid JSON, keep as string
			}
		}

		obj[key] = value;
	});

	// Handle unchecked checkboxes - they are not included in FormData
	// This needs to be handled at the schema level with .default(false)

	return obj;
}

/**
 * Format Zod errors into a field -> message map
 */
export function formatZodErrors(error: z.ZodError): Record<string, string> {
	const errors: Record<string, string> = {};

	error.issues.forEach((issue) => {
		const path = issue.path.join('.');
		if (path && !errors[path]) {
			errors[path] = issue.message;
		}
	});

	return errors;
}

/**
 * Create a safe parser that doesn't throw
 */
export function createSafeParser<T>(schema: ZodSchema<T>) {
	return (data: unknown): ValidationResult<T> => validate(schema, data);
}

/**
 * Preprocess FormData for checkbox fields that default to false
 */
export function preprocessCheckboxes(
	formData: FormData,
	checkboxFields: string[]
): Record<string, unknown> {
	const obj = formDataToObject(formData);

	// Ensure checkbox fields exist with boolean values
	checkboxFields.forEach((field) => {
		if (!(field in obj) || obj[field] === null) {
			obj[field] = false;
		}
	});

	return obj;
}

/**
 * Validate and return SvelteKit fail() compatible response
 */
export function validateOrFail<T>(
	schema: ZodSchema<T>,
	formData: FormData,
	checkboxFields: string[] = []
): { valid: true; data: T } | { valid: false; errors: Record<string, string>; message: string } {
	const data = preprocessCheckboxes(formData, checkboxFields);
	const result = validate(schema, data);

	if (result.success && result.data) {
		return { valid: true, data: result.data };
	}

	const firstError = result.flatErrors?.[0] || 'Validation failed';
	return {
		valid: false,
		errors: result.errors || {},
		message: firstError
	};
}
