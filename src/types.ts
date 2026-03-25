export interface ComponentDocument {
    id: string;
    prompt: string;
    code: string;
    title: string;
    createdAt: number;
}

export type GenerationState =
    | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'success'; code: string; prompt: string }
    | { status: 'error'; message: string };

export type GalleryState =
    | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'success'; components: ComponentDocument[] }
    | { status: 'error'; message: string };

export interface PromptInputProps {
    onGenerate: (prompt: string) => void;
    isLoading: boolean;
}

export interface PreviewPanelProps {
    state: GenerationState;
    onSave: () => void;
    isSaving: boolean;
}

export interface GalleryGridProps {
    state: GalleryState;
    onRefresh: () => void;
}