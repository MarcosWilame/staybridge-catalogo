import { useState } from 'react';
import {
  hasSupabaseConfig,
  listPropertyImagesInStorageFolder,
  listPropertyStorageFolder,
  type SupabaseAuthSession,
} from '../../data/supabaseProperties';
import {
  INITIAL_ASSISTANT_FORM,
  getAssistantUnitFolder,
  simplifyAssistantText,
  type CadastroAssistantForm,
  type CadastroAssistantResult,
} from './cadastroAssistantUtils';

type UseCadastroAssistantOptions = {
  session: SupabaseAuthSession | null;
  onMediaFound: (result: CadastroAssistantResult) => void;
  onMessage: (message: string) => void;
  onError: (message: string) => void;
};

export function useCadastroAssistant({
  session,
  onMediaFound,
  onMessage,
  onError,
}: UseCadastroAssistantOptions) {
  const [form, setForm] = useState<CadastroAssistantForm>(INITIAL_ASSISTANT_FORM);
  const [result, setResult] = useState<CadastroAssistantResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const reset = () => {
    setForm(INITIAL_ASSISTANT_FORM);
    setResult(null);
    setIsLoading(false);
  };

  const searchMedia = async () => {
    if (!session || !hasSupabaseConfig()) {
      onError('Entre no admin e confira a configuração do Supabase antes de usar o assistente');
      return;
    }

    const regionFolder = form.region === 'north' ? 'NORTH-PICS' : 'SOUTH-PICS';
    const rootPath = `library/${regionFolder}`;
    const addressSlug = simplifyAssistantText(form.address);
    const unitFolder = getAssistantUnitFolder(form.category, form.unit);
    const unitSlug = simplifyAssistantText(unitFolder);

    if (!form.address.trim() || !unitFolder) {
      onError('Informe endereço e número do room/flat para buscar a mídia');
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const root = await listPropertyStorageFolder({
        accessToken: session.access_token,
        prefix: rootPath,
      });
      const addressFolder = root.folders.find(
        (folder) => simplifyAssistantText(folder.name) === addressSlug
      );

      if (!addressFolder) {
        onMessage(`Pasta do endereço não encontrada em ${rootPath}`);
        return;
      }

      const addressContent = await listPropertyStorageFolder({
        accessToken: session.access_token,
        prefix: addressFolder.path,
      });
      const unitMatch = addressContent.folders.find(
        (folder) => simplifyAssistantText(folder.name) === unitSlug
      );
      const targetPath = unitMatch?.path || addressFolder.path;
      const [allImages, targetContent] = await Promise.all([
        listPropertyImagesInStorageFolder({
          accessToken: session.access_token,
          prefix: targetPath,
          limit: 60,
        }),
        listPropertyStorageFolder({
          accessToken: session.access_token,
          prefix: targetPath,
        }),
      ]);
      const nextResult: CadastroAssistantResult = {
        path: targetPath,
        images: allImages.slice(0, 15),
        videos: targetContent.videos.slice(0, 3),
        totalImages: allImages.length,
        totalVideos: targetContent.videos.length,
      };

      setResult(nextResult);
      onMediaFound(nextResult);
      onMessage(
        `Assistente encontrou ${nextResult.totalImages} imagens e ${nextResult.totalVideos} vídeos`
      );
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Erro ao buscar mídia do assistente');
    } finally {
      setIsLoading(false);
    }
  };

  return { form, setForm, result, isLoading, reset, searchMedia };
}
