export interface FileType {
	asset_id: string
	public_id: string
	version: number,
	version_id: string
	signature: string
	width: number,
	height: number,
	format: string
	resource_type: string
	created_at: Date,
	tags: string[],
	pages: number,
	bytes: number,
	type: string
	etag: string
	placeholder: boolean,
	url: string
	secure_url: string
	access_mode: string
	original_filename: string
	api_key: string
}

export default {
	asset_id: {
		type: String
	},
	public_id: {
		type: String
	},
	version: {
		type: Number
	},
	version_id: {
		type: String
	},
	signature: {
		type: String
	},
	width: {
		type: Number
	},
	height: {
		type: Number
	},
	format: {
		type: String
	},
	resource_type: {
		type: String
	},
	created_at: {
		type: Date
	},
	tags: {
		type: [ String ]
	},
	pages: {
		type: Number
	},
	bytes: {
		type: Number
	},
	type: {
		type: String
	},
	etag: {
		type: String
	},
	placeholder: {
		type: Boolean
	},
	url: {
		type: String
	},
	secure_url: {
		type: String
	},
	access_mode: {
		type: String
	},
	original_filename: {
		type: String
	},
	api_key: {
		type: String
	}
}