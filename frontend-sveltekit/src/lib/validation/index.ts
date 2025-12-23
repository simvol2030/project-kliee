// Validation schemas
export {
	artworkSchema,
	seriesSchema,
	pageSchema,
	exhibitionSchema,
	menuItemSchema,
	contactMessageSchema,
	mediaSchema,
	settingsSchema,
	type ArtworkInput,
	type SeriesInput,
	type PageInput,
	type ExhibitionInput,
	type MenuItemInput,
	type ContactMessageInput,
	type MediaInput,
	type SettingsInput
} from './schemas';

// Validation utilities
export {
	validate,
	validateFormData,
	validateOrFail,
	formDataToObject,
	formatZodErrors,
	createSafeParser,
	preprocessCheckboxes,
	type ValidationResult
} from './validators';
