import { FolderOpen, Home, UploadCloud, Video } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import type {
  StorageFolderItem,
  StorageImageItem,
  StorageVideoItem,
} from '../../data/supabaseProperties';
import type { FolderInputProps } from './adminConfig';

type AdminLibraryPageProps = {
  path: string;
  folders: StorageFolderItem[];
  images: StorageImageItem[];
  videos: StorageVideoItem[];
  isLoading: boolean;
  isUploading: boolean;
  uploadProgress: string;
  onOpen: (path?: string) => void;
  onBack: () => void;
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export function AdminLibraryPage({
  path,
  folders,
  images,
  videos,
  isLoading,
  isUploading,
  uploadProgress,
  onOpen,
  onBack,
  onUpload,
}: AdminLibraryPageProps) {
  return (
    <section className="border-y border-[var(--surface-border)] bg-white shadow-[var(--surface-shadow)] lg:border">
      <header className="flex flex-col gap-3 border-b border-[var(--surface-border)] px-5 py-5 sm:flex-row sm:items-center sm:justify-between md:px-6">
        <div>
          <h2 className="text-2xl font-extrabold text-[var(--green-dark)]">Biblioteca</h2>
          <p className="mt-1 text-sm font-semibold text-gray-500">
            Navegue pelas pastas de imagens e vídeos do Supabase.
          </p>
        </div>
        <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-md bg-[var(--green-dark)] px-4 py-2.5 text-sm font-bold text-white hover:bg-[var(--green-medium)]">
          <input
            {...({
              type: 'file',
              accept: 'image/*',
              multiple: true,
              disabled: isUploading,
              webkitdirectory: '',
              directory: '',
              mozdirectory: '',
              onChange: onUpload,
              className: 'hidden',
            } satisfies FolderInputProps)}
          />
          <UploadCloud className="h-4 w-4" />
          {isUploading && uploadProgress ? `Enviando ${uploadProgress}` : 'Enviar pasta'}
        </label>
      </header>

      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--surface-border)] bg-[var(--gray-light)] px-5 py-3 md:px-6">
        <button
          type="button"
          onClick={() => onOpen('library')}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 hover:border-[var(--green-dark)]"
        >
          <Home className="h-4 w-4" />
          Library
        </button>
        <button
          type="button"
          onClick={onBack}
          disabled={!path || path === 'library' || isLoading}
          className="rounded-md border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 disabled:opacity-40"
        >
          Voltar
        </button>
        <span className="min-w-0 flex-1 truncate text-xs font-bold text-gray-600">
          {path || 'Abra a biblioteca para começar'}
        </span>
      </div>

      <div className="p-5 md:p-6">
        {!path && (
          <button
            type="button"
            onClick={() => onOpen('library')}
            className="inline-flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2.5 text-sm font-bold text-white"
          >
            <FolderOpen className="h-4 w-4" />
            Abrir biblioteca
          </button>
        )}

        {isLoading && <p className="py-8 text-center text-sm font-bold text-gray-500">Carregando...</p>}

        {!isLoading && folders.length > 0 && (
          <div className="mb-6 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {folders.map((folder) => (
              <button
                key={folder.path}
                type="button"
                onClick={() => onOpen(folder.path)}
                className="flex min-w-0 items-center gap-3 rounded-md border border-gray-200 px-3 py-3 text-left text-sm font-bold text-gray-800 hover:border-[var(--green-dark)] hover:bg-[var(--gray-light)]"
              >
                <FolderOpen className="h-5 w-5 shrink-0 text-[var(--green-dark)]" />
                <span className="truncate">{folder.name}</span>
              </button>
            ))}
          </div>
        )}

        {!isLoading && images.length > 0 && (
          <div className="mb-6">
            <h3 className="mb-3 text-sm font-extrabold text-gray-800">Imagens ({images.length})</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
              {images.map((item) => (
                <figure key={item.path} className="min-w-0">
                  <ImageWithFallback src={item.url} className="aspect-[4/3] w-full rounded-md object-cover" />
                  <figcaption className="mt-1 truncate text-xs font-semibold text-gray-500">{item.name}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        )}

        {!isLoading && videos.length > 0 && (
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-extrabold text-gray-800">
              <Video className="h-4 w-4" /> Vídeos ({videos.length})
            </h3>
            <div className="grid gap-3 md:grid-cols-2">
              {videos.map((item) => (
                <div key={item.path} className="overflow-hidden rounded-md border border-gray-200">
                  <video src={item.url} controls preload="metadata" className="h-44 w-full bg-black object-contain" />
                  <p className="truncate px-3 py-2 text-xs font-bold text-gray-600">{item.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
