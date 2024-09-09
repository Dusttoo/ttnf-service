export interface MediaResponse {
    id: string;
    url: string;
    type: 'image' | 'video';
    filename: string;
}

// Image Interface extending MediaResponse

export interface ImageResponse extends MediaResponse {
    type: 'image';
    width: number;
    height: number;
}

// Video Interface extending MediaResponse

export interface VideoResponse extends MediaResponse {
    type: 'video';
    duration: number;
}