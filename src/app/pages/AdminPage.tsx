import { useState, useEffect, useRef } from 'react';
import { Property } from '../data/properties';
import {
  AlertCircle,
  Bath,
  BedDouble,
  Building2,
  CalendarDays,
  Check,
  Cloud,
  Download,
  Eye,
  EyeOff,
  FileText,
  FolderOpen,
  Home,
  ImagePlus,
  ListChecks,
  Lock,
  LogIn,
  MapPin,
  Navigation,
  Plus,
  PoundSterling,
  Save,
  Search,
  Train,
  Trash2,
  UploadCloud,
  Users,
  Video,
  X,
} from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import {
  deletePropertyFromSupabase,
  getStoredAdminSession,
  hasSupabaseConfig,
  listPropertyImagesInStorageFolder,
  listPropertyStorageFolder,
  loadPropertiesFromSupabase,
  replacePropertiesInSupabase,
  savePropertyToSupabase,
  searchPropertyImagesInStorage,
  signInAdmin,
  normalizeImageUrl,
  normalizeVideoUrl,
  type SupabaseAuthSession,
  type StorageFolderItem,
  type StorageImageItem,
  uploadLibraryImageToStorage,
  uploadPropertyImageToStorage,
  uploadPropertyVideoToStorage,
} from '../data/supabaseProperties';
import { buildEuroPrice, formatEuroPrice, getPricePeriod, getPriceValue } from '../utils/price';
import {
  getRecoveryDaysLeft,
  isInRecovery,
  isRecoveryExpired,
} from '../utils/recovery';
import { AdminFieldLabel, AdminSwitch } from './admin/AdminControls';
import {
  AMENITY_OPTIONS,
  CATEGORY_OPTIONS,
  INITIAL_FORM,
  MOVE_IN_OPTIONS,
  PRICE_PERIOD_OPTIONS,
  STATION_SUGGESTIONS,
  adminInputClass,
  adminTextAreaClass,
  getCategoryLabel,
  getStationMapQuery,
  type AdminAvailabilityFilter,
  type AdminStatusFilter,
  type FolderInputProps,
} from './admin/adminConfig';

export function AdminPage() {
  const [session, setSession] = useState<SupabaseAuthSession | null>(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [syncMessage, setSyncMessage] = useState('');
  const [syncError, setSyncError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Omit<Property, 'id'>>(INITIAL_FORM);
  const [statusFilter, setStatusFilter] = useState<AdminStatusFilter>('all');
  const [adminTypeFilter, setAdminTypeFilter] = useState('');
  const [adminRegionFilter, setAdminRegionFilter] = useState('');
  const [adminAvailabilityFilter, setAdminAvailabilityFilter] =
    useState<AdminAvailabilityFilter>('all');
  const [adminSearchQuery, setAdminSearchQuery] = useState('');
  const [imageInput, setImageInput] = useState('');
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [isUploadingLibrary, setIsUploadingLibrary] = useState(false);
  const [libraryUploadProgress, setLibraryUploadProgress] = useState('');
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [storageImageSearch, setStorageImageSearch] = useState('');
  const [storageImageResults, setStorageImageResults] = useState<StorageImageItem[]>([]);
  const [isSearchingStorageImages, setIsSearchingStorageImages] = useState(false);
  const [isStorageBrowserOpen, setIsStorageBrowserOpen] = useState(false);
  const [storageFolderPath, setStorageFolderPath] = useState('');
  const [storageFolders, setStorageFolders] = useState<StorageFolderItem[]>([]);
  const [storageFolderImages, setStorageFolderImages] = useState<StorageImageItem[]>([]);
  const [isLoadingStorageFolder, setIsLoadingStorageFolder] = useState(false);
  const [stationInput, setStationInput] = useState('');
  const formRef = useRef<HTMLDivElement | null>(null);

  const scrollToForm = () => {
    window.requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  };

  useEffect(() => {
    setSession(getStoredAdminSession());
    setIsAuthLoading(false);
  }, []);

  // Carregar somente apos login para evitar leitura publica no Supabase.
  useEffect(() => {
    const loadProperties = async () => {
      if (!session) {
        setProperties([]);
        return;
      }

      if (!hasSupabaseConfig()) {
        setProperties([]);
        setSyncError('Supabase nao configurado');
        return;
      }

      try {
        const remoteProperties = await loadPropertiesFromSupabase(session.access_token);
        const expiredRecoveryItems = remoteProperties.filter(isRecoveryExpired);

        if (expiredRecoveryItems.length) {
          await Promise.all(
            expiredRecoveryItems.map((property) =>
              deletePropertyFromSupabase(property.id, session.access_token)
            )
          );
        }

        setProperties(remoteProperties.filter((property) => !isRecoveryExpired(property)));
        setSyncError('');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro ao sincronizar com Supabase';
        setProperties([]);
        setSyncError(message);
      }
    };

    void loadProperties();
  }, [session]);

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError('');
    setIsSigningIn(true);

    try {
      const signedSession = await signInAdmin(authEmail.trim(), authPassword);
      setSession(signedSession);
      setAuthPassword('');
      setSyncError('');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao entrar';
      setAuthError(message);
    } finally {
      setIsSigningIn(false);
    }
  };

  const nextId = Math.max(0, ...properties.map(p => p.id)) + 1;
  const activeProperties = properties.filter(
    (property) => !isInRecovery(property) && !isRecoveryExpired(property)
  );
  const recoveryProperties = properties.filter(isInRecovery);
  const listedCount = activeProperties.filter((property) => property.listed !== false).length;
  const hiddenCount = activeProperties.length - listedCount;
  const availableCount = activeProperties.filter((property) => property.available).length;
  const unavailableCount = activeProperties.length - availableCount;
  const adminRegionOptions = Array.from(
    new Set(activeProperties.map((property) => property.region).filter(Boolean))
  ).sort();
  const normalizedAdminSearch = adminSearchQuery.trim().toLowerCase();
  const adminPropertiesForStatus =
    statusFilter === 'trash' ? recoveryProperties : activeProperties;
  const visibleAdminProperties = adminPropertiesForStatus.filter((property) => {
    if (statusFilter === 'trash') return true;
    if (statusFilter === 'listed' && property.listed === false) return false;
    if (statusFilter === 'hidden' && property.listed !== false) return false;
    if (adminTypeFilter && property.category !== adminTypeFilter) return false;
    if (adminRegionFilter && property.region !== adminRegionFilter) return false;
    if (adminAvailabilityFilter === 'available' && !property.available) return false;
    if (adminAvailabilityFilter === 'unavailable' && property.available) return false;

    if (!normalizedAdminSearch) return true;

    return [
      String(property.id),
      property.title,
      property.type,
      property.region,
      property.address,
      property.postcode,
    ]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(normalizedAdminSearch));
  });
  const visibleAmenityOptions = Array.from(new Set([...AMENITY_OPTIONS, ...formData.amenities]));
  const stationMapQuery = getStationMapQuery(formData);
  const stationMapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    stationMapQuery
  )}&z=14&output=embed`;
  const stationSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    stationMapQuery
  )}`;

  const handleAddImage = () => {
    const imageUrl = normalizeImageUrl(imageInput);

    if (imageUrl) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, imageUrl],
        image: prev.image || imageUrl
      }));
      setImageInput('');
    }
  };

  const handleUploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';

    if (!files.length) return;

    const imageFiles = files
      .filter((file) => file.type.startsWith('image/'))
      .sort((a, b) => {
        const pathA = a.webkitRelativePath || a.name;
        const pathB = b.webkitRelativePath || b.name;
        return pathA.localeCompare(pathB, undefined, {
          numeric: true,
          sensitivity: 'base',
        });
      });

    if (!imageFiles.length) {
      alert('Selecione uma ou mais imagens validas');
      return;
    }

    if (!session || !hasSupabaseConfig()) {
      alert('Entre no admin e confira a configuracao do Supabase antes de enviar imagens');
      return;
    }

    const propertyId = editingId !== null ? editingId : nextId;
    const batchId = Date.now().toString(36);
    const imageUrls: string[] = [];

    setIsUploadingImages(true);
    setSyncError('');

    try {
      for (const [index, file] of imageFiles.entries()) {
        setUploadProgress(`${index + 1}/${imageFiles.length}`);

        const imageUrl = await uploadPropertyImageToStorage({
          file,
          propertyId,
          accessToken: session.access_token,
          batchId,
          relativePath: file.webkitRelativePath || file.name,
        });

        imageUrls.push(imageUrl);
      }

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...imageUrls],
        image: prev.image || imageUrls[0] || '',
      }));

      if (files.length !== imageFiles.length) {
        alert(`${imageFiles.length} imagens adicionadas. Arquivos que nao eram imagem foram ignorados.`);
      }
      setSyncMessage(`${imageUrls.length} imagens enviadas para o Supabase Storage`);
      setTimeout(() => setSyncMessage(''), 3000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Nao foi possivel carregar a imagem';
      setSyncError(message);
      alert(message);
    } finally {
      setIsUploadingImages(false);
      setUploadProgress('');
    }
  };

  const handleUploadLibraryFolder = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';

    if (!files.length) return;

    const imageFiles = files
      .filter((file) => file.type.startsWith('image/'))
      .sort((a, b) => {
        const pathA = a.webkitRelativePath || a.name;
        const pathB = b.webkitRelativePath || b.name;
        return pathA.localeCompare(pathB, undefined, {
          numeric: true,
          sensitivity: 'base',
        });
      });

    if (!imageFiles.length) {
      alert('Selecione uma pasta com imagens validas');
      return;
    }

    if (!session || !hasSupabaseConfig()) {
      alert('Entre no admin e confira a configuracao do Supabase antes de enviar imagens');
      return;
    }

    let uploadedCount = 0;

    setIsUploadingLibrary(true);
    setSyncError('');
    setSyncMessage('');

    try {
      const failedFiles: Array<{ path: string; error: string }> = [];

      for (const [index, file] of imageFiles.entries()) {
        setLibraryUploadProgress(`${index + 1}/${imageFiles.length}`);
        const filePath = file.webkitRelativePath || file.name;

        try {
          await uploadLibraryImageToStorage({
            file,
            accessToken: session.access_token,
            relativePath: filePath,
          });

          uploadedCount += 1;
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Erro desconhecido no upload';
          failedFiles.push({ path: filePath, error: message });

          if (uploadedCount === 0 && failedFiles.length >= 5) {
            break;
          }
        }
      }

      const stoppedEarly = uploadedCount === 0 && failedFiles.length >= 5;
      const firstError = failedFiles[0]?.error || '';

      setSyncMessage(
        failedFiles.length
          ? `${uploadedCount} imagens enviadas, ${failedFiles.length} falharam`
          : `${uploadedCount} imagens enviadas para a biblioteca`
      );
      setTimeout(() => setSyncMessage(''), 4000);

      if (failedFiles.length) {
        if (firstError) setSyncError(firstError);

        alert(
          `${stoppedEarly ? 'Upload interrompido apos 5 falhas seguidas.' : `Algumas imagens nao subiram (${failedFiles.length}).`}\n\nErro principal:\n${firstError || 'Erro nao informado'}\n\nPrimeiras falhas:\n${failedFiles
            .slice(0, 8)
            .map((item) => `${item.path}: ${item.error}`)
            .join('\n')}`
        );
      }

      if (isStorageBrowserOpen) {
        void handleOpenStorageFolder('library');
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Nao foi possivel enviar a biblioteca';
      setSyncError(message);
      alert(message);
    } finally {
      setIsUploadingLibrary(false);
      setLibraryUploadProgress('');
    }
  };

  const handleSearchStorageImages = async () => {
    if (!session || !hasSupabaseConfig()) {
      alert('Entre no admin e confira a configuracao do Supabase antes de buscar imagens');
      return;
    }

    setIsSearchingStorageImages(true);
    setSyncError('');

    try {
      const results = await searchPropertyImagesInStorage({
        accessToken: session.access_token,
        query: storageImageSearch,
      });

      setStorageImageResults(results);
      setSyncMessage(
        results.length
          ? `${results.length} imagens encontradas no Supabase`
          : 'Nenhuma imagem encontrada no Supabase'
      );
      setTimeout(() => setSyncMessage(''), 3000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao buscar imagens';
      setSyncError(message);
      alert(message);
    } finally {
      setIsSearchingStorageImages(false);
    }
  };

  const handleAddStorageImage = (imageUrl: string) => {
    setFormData(prev => {
      if (prev.images.includes(imageUrl)) return prev;

      return {
        ...prev,
        images: [...prev.images, imageUrl],
        image: prev.image || imageUrl,
      };
    });
  };

  const handleAddStorageImages = (items: StorageImageItem[]) => {
    if (!items.length) {
      setSyncMessage('Nenhuma imagem para adicionar');
      setTimeout(() => setSyncMessage(''), 3000);
      return;
    }

    let addedCount = 0;

    setFormData(prev => {
      const existingUrls = new Set(prev.images);
      const nextUrls = items
        .map((item) => item.url)
        .filter((url) => {
          if (existingUrls.has(url)) return false;
          existingUrls.add(url);
          addedCount += 1;
          return true;
        });

      if (!nextUrls.length) return prev;

      return {
        ...prev,
        images: [...prev.images, ...nextUrls],
        image: prev.image || nextUrls[0] || '',
      };
    });

    setSyncMessage(
      addedCount
        ? `${addedCount} imagens adicionadas ao imovel`
        : 'Essas imagens ja estavam na galeria'
    );
    setTimeout(() => setSyncMessage(''), 3000);
  };

  const handleOpenStorageFolder = async (prefix = '') => {
    if (!session || !hasSupabaseConfig()) {
      alert('Entre no admin e confira a configuracao do Supabase antes de abrir as pastas');
      return;
    }

    setIsStorageBrowserOpen(true);
    setIsLoadingStorageFolder(true);
    setSyncError('');

    try {
      const result = await listPropertyStorageFolder({
        accessToken: session.access_token,
        prefix,
      });

      setStorageFolderPath(prefix);
      setStorageFolders(result.folders);
      setStorageFolderImages(result.images);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao abrir pasta';
      setSyncError(message);
      alert(message);
    } finally {
      setIsLoadingStorageFolder(false);
    }
  };

  const handleBackStorageFolder = () => {
    if (!storageFolderPath) return;

    const nextPath = storageFolderPath.split('/').slice(0, -1).join('/');
    void handleOpenStorageFolder(nextPath);
  };

  const handleAddCurrentStorageFolder = async () => {
    if (!session || !hasSupabaseConfig()) {
      alert('Entre no admin e confira a configuracao do Supabase antes de adicionar a pasta');
      return;
    }

    setIsLoadingStorageFolder(true);
    setSyncError('');

    try {
      const images = await listPropertyImagesInStorageFolder({
        accessToken: session.access_token,
        prefix: storageFolderPath,
      });

      handleAddStorageImages(images);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao adicionar pasta';
      setSyncError(message);
      alert(message);
    } finally {
      setIsLoadingStorageFolder(false);
    }
  };

  const handleVideoUrlChange = (value: string) => {
    setFormData(prev => ({ ...prev, video: value }));
  };

  const handleVideoUrlBlur = () => {
    setFormData(prev => ({
      ...prev,
      video: normalizeVideoUrl(prev.video || ''),
    }));
  };

  const handleUploadVideo = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    if (!file.type.startsWith('video/')) {
      alert('Selecione um arquivo de video valido');
      return;
    }

    if (!session || !hasSupabaseConfig()) {
      alert('Entre no admin e confira a configuracao do Supabase antes de enviar video');
      return;
    }

    const propertyId = editingId !== null ? editingId : nextId;

    setIsUploadingVideo(true);
    setSyncError('');

    try {
      const videoUrl = await uploadPropertyVideoToStorage({
        file,
        propertyId,
        accessToken: session.access_token,
      });

      setFormData(prev => ({ ...prev, video: videoUrl }));
      setSyncMessage('Video enviado para o Supabase Storage');
      setTimeout(() => setSyncMessage(''), 3000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Nao foi possivel enviar o video';
      setSyncError(message);
      alert(message);
    } finally {
      setIsUploadingVideo(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => {
      const removedImage = prev.images[index];
      const newImages = prev.images.filter((_, i) => i !== index);
      return {
        ...prev,
        images: newImages,
        image: prev.image === removedImage ? newImages[0] || '' : prev.image
      };
    });
  };

  const handleToggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((item) => item !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleSetCoverImage = (index: number) => {
    setFormData(prev => {
      const selected = prev.images[index];
      if (!selected) return prev;

      return {
        ...prev,
        image: selected,
        images: [selected, ...prev.images.filter((_, i) => i !== index)],
      };
    });
  };

  const handleCategoryChange = (category: string) => {
    setFormData(prev => ({
      ...prev,
      category,
      type: getCategoryLabel(category),
    }));
  };

  const handlePriceAmountChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      price: buildEuroPrice(value, getPricePeriod(prev.price)),
    }));
  };

  const handlePricePeriodChange = (period: string) => {
    setFormData(prev => ({
      ...prev,
      price: buildEuroPrice(getPriceValue(prev.price), period),
    }));
  };

  const handleAddStation = () => {
    if (stationInput.trim()) {
      setFormData(prev => ({
        ...prev,
        nearbyStations: [...prev.nearbyStations, stationInput.trim()]
      }));
      setStationInput('');
    }
  };

  const handleRemoveStation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      nearbyStations: prev.nearbyStations.filter((_, i) => i !== index)
    }));
  };

  const handleSaveProperty = async () => {
    if (!formData.title || !formData.image) {
      alert('Título e imagem principal são obrigatórios');
      return;
    }

    if (getPriceValue(formData.price) <= 0) {
      alert('Informe um preço em libra maior que zero');
      return;
    }

    const propertyToSave: Property = {
      ...formData,
      type: getCategoryLabel(formData.category),
      price: formatEuroPrice(formData.price),
      deletedAt: undefined,
      id: editingId !== null ? editingId : nextId,
    };

    try {
      if (!hasSupabaseConfig() || !session) {
        throw new Error('Supabase nao configurado');
      }

      const savedProperty = await savePropertyToSupabase(
        propertyToSave,
        session.access_token
      );

      setProperties((prev) =>
        editingId !== null
          ? prev.map((property) =>
              property.id === editingId ? savedProperty : property
            )
          : [...prev, savedProperty]
      );

      setSyncMessage('Imóvel salvo online no Supabase');

      setSyncError('');
      resetForm();
      setTimeout(() => setSyncMessage(''), 3000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao salvar imóvel';
      setSyncError(message);
      alert(message);
    }
  };

  const handleEditProperty = (property: Property) => {
    const { id, ...rest } = property;
    setFormData({ ...rest, price: formatEuroPrice(rest.price) });
    setEditingId(id);
    setShowForm(true);
    scrollToForm();
  };

  const handleAddSuggestedStation = (station: string) => {
    setFormData(prev => ({
      ...prev,
      nearbyStations: prev.nearbyStations.includes(station)
        ? prev.nearbyStations
        : [...prev.nearbyStations, station],
    }));
  };

  const handleConfirmDeleteProperty = async (property: Property) => {
    if (!confirm(`Mover "${property.title}" para a lixeira por ate 3 semanas?`)) return;

    try {
      if (!hasSupabaseConfig() || !session) {
        throw new Error('Supabase nao configurado');
      }

      const savedProperty = await savePropertyToSupabase(
        {
          ...property,
          listed: false,
          deletedAt: new Date().toISOString(),
        },
        session.access_token
      );

      setProperties((prev) =>
        prev.map((item) => (item.id === property.id ? savedProperty : item))
      );
      setSyncError('');
      setSyncMessage('Imovel movido para a lixeira por ate 3 semanas');
      setTimeout(() => setSyncMessage(''), 3000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao deletar imovel';
      setSyncError(message);
      alert(message);
    }
  };

  const handleRestoreProperty = async (property: Property) => {
    try {
      if (!hasSupabaseConfig() || !session) {
        throw new Error('Supabase nao configurado');
      }

      const savedProperty = await savePropertyToSupabase(
        {
          ...property,
          listed: true,
          deletedAt: undefined,
        },
        session.access_token
      );

      setProperties((prev) =>
        prev.map((item) => (item.id === property.id ? savedProperty : item))
      );
      setSyncError('');
      setSyncMessage('Imovel restaurado');
      setTimeout(() => setSyncMessage(''), 3000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao restaurar imovel';
      setSyncError(message);
      alert(message);
    }
  };

  const handlePermanentDeleteProperty = async (property: Property) => {
    const confirmation = window.prompt(
      `Esta acao remove definitivamente o imovel #${property.id} - ${property.title}.\nDigite DELETAR para confirmar.`
    );

    if (confirmation !== 'DELETAR') return;

    try {
      if (!hasSupabaseConfig() || !session) {
        throw new Error('Supabase nao configurado');
      }

      await deletePropertyFromSupabase(property.id, session.access_token);

      setProperties((prev) => prev.filter((item) => item.id !== property.id));
      setSyncError('');
      setSyncMessage('Imovel excluido definitivamente');
      setTimeout(() => setSyncMessage(''), 3000);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao excluir definitivamente';
      setSyncError(message);
      alert(message);
    }
  };

  const handleToggleListed = async (property: Property) => {
    try {
      if (!hasSupabaseConfig() || !session) {
        throw new Error('Supabase nao configurado');
      }

      const nextListed = property.listed === false;
      const savedProperty = await savePropertyToSupabase(
        {
          ...property,
          listed: nextListed,
        },
        session.access_token
      );

      setProperties((prev) =>
        prev.map((item) => (item.id === property.id ? savedProperty : item))
      );
      setSyncError('');
      setSyncMessage(
        nextListed
          ? 'Imovel ativado na listagem publica'
          : 'Imovel ocultado da listagem publica'
      );
      setTimeout(() => setSyncMessage(''), 3000);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao atualizar visibilidade';
      setSyncError(message);
      alert(message);
    }
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM);
    setImageInput('');
    setIsUploadingImages(false);
    setUploadProgress('');
    setIsUploadingLibrary(false);
    setLibraryUploadProgress('');
    setIsUploadingVideo(false);
    setStorageImageSearch('');
    setStorageImageResults([]);
    setIsSearchingStorageImages(false);
    setIsStorageBrowserOpen(false);
    setStorageFolderPath('');
    setStorageFolders([]);
    setStorageFolderImages([]);
    setIsLoadingStorageFolder(false);
    setStationInput('');
    setEditingId(null);
    setShowForm(false);
  };

  const openNewPropertyForm = () => {
    resetForm();
    setShowForm(true);
    scrollToForm();
  };

  const handleDownloadJson = () => {
    const json = JSON.stringify(properties, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'properties.json';
    a.click();
    URL.revokeObjectURL(url);
    setSyncMessage('JSON exportado com sucesso');
    setTimeout(() => setSyncMessage(''), 3000);
  };

  const handleLoadJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (!Array.isArray(data)) {
          alert('Arquivo JSON inválido');
          return;
        }

        if (!hasSupabaseConfig() || !session) {
          throw new Error('Supabase nao configurado');
        }

        const savedProperties = await replacePropertiesInSupabase(
          data,
          session.access_token
        );
        setProperties(savedProperties);
        setSyncMessage('JSON importado e publicado no Supabase');
        setTimeout(() => setSyncMessage(''), 3000);

        alert('JSON carregado com sucesso!');
        setSyncError('');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro ao ler o arquivo JSON';
        setSyncError(message);
        alert(message);
      }
    };
    reader.readAsText(file);
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[image:var(--soft-gradient)] pt-28 pb-20">
        <div className="mx-auto max-w-md px-4">
          <div className="rounded-lg border border-[var(--surface-border)] bg-white p-6 text-center shadow-[var(--surface-shadow)]">
            <p className="font-semibold text-gray-700">Verificando acesso...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[image:var(--soft-gradient)] pt-28 pb-20">
        <div className="mx-auto max-w-md px-4">
          <form
            onSubmit={handleSignIn}
            className="rounded-lg border border-[var(--surface-border)] bg-white p-6 shadow-[var(--surface-shadow)]"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--green-dark)] text-white">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin</h1>
                <p className="text-sm text-gray-600">Entre com suas credenciais</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-bold">E-mail</label>
                <input
                  type="email"
                  value={authEmail}
                  onChange={(event) => setAuthEmail(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  autoComplete="email"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">Senha</label>
                <input
                  type="password"
                  value={authPassword}
                  onChange={(event) => setAuthPassword(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            {authError && (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                <AlertCircle className="h-4 w-4" />
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSigningIn}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--green-dark)] px-4 py-3 font-bold text-white hover:bg-[var(--green-medium)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              <LogIn className="h-5 w-5" />
              {isSigningIn ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[image:var(--soft-gradient)] pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-6 overflow-hidden rounded-lg border border-[var(--surface-border)] bg-white shadow-[var(--surface-shadow)]">
          <div className="border-l-4 border-[var(--green-dark)] px-5 py-5 md:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-md border border-[var(--surface-border)] bg-[var(--gray-light)] px-3 py-1 text-xs font-black uppercase tracking-wide text-[var(--green-dark)]">
                  <Building2 className="h-4 w-4" />
                  Painel administrativo
                </div>
                <h1 className="text-4xl font-extrabold text-[var(--green-dark)] mb-2">Gerenciar Imóveis</h1>
                <p className="text-gray-600">Adicione, edite, oculte ou remova propriedades do catálogo.</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-[var(--surface-border)] bg-[var(--gray-light)] px-5 py-3 text-sm md:px-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 font-semibold text-gray-700 shadow-sm">
              <Cloud className="h-4 w-4" />
              Fonte ativa: Supabase
            </span>

            {session.user?.email && (
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 font-semibold text-gray-700 shadow-sm">
                <Lock className="h-4 w-4" />
                {session.user.email}
              </span>
            )}

            {syncError && (
              <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 font-semibold text-red-700">
                <AlertCircle className="h-4 w-4" />
                {syncError}
              </span>
            )}
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-3 rounded-lg border border-[var(--surface-border)] bg-white p-4 shadow-[var(--surface-shadow)] sm:flex-row sm:flex-wrap">
          <button
            onClick={openNewPropertyForm}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--green-dark)] px-4 py-2 font-bold text-white shadow-sm transition hover:bg-[var(--green-medium)] sm:w-auto"
          >
            <Plus className="w-5 h-5" />
            Novo Imóvel
          </button>

          <label className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-[var(--green-dark)] bg-white px-4 py-2 font-bold text-[var(--green-dark)] transition hover:bg-[var(--green-light)] sm:w-auto">
            <input
              {...({
                type: 'file',
                accept: 'image/*',
                multiple: true,
                disabled: isUploadingLibrary,
                webkitdirectory: '',
                directory: '',
                mozdirectory: '',
                onChange: handleUploadLibraryFolder,
                className: 'hidden',
              } satisfies FolderInputProps)}
            />
            <FolderOpen className="h-5 w-5" />
            {isUploadingLibrary && libraryUploadProgress
              ? `Enviando ${libraryUploadProgress}`
              : 'Enviar pasta para biblioteca'}
          </label>

          <button
            onClick={handleDownloadJson}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--green-dark)] px-4 py-2 font-bold text-[var(--green-dark)] transition hover:bg-[var(--green-dark)] hover:text-white sm:w-auto"
          >
            <Download className="w-5 h-5" />
            Exportar JSON
          </button>

          <label className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-[var(--surface-border)] bg-[var(--gray-light)] px-4 py-2 font-bold text-gray-700 transition hover:bg-white sm:w-auto">
            <input
              type="file"
              accept=".json"
              onChange={handleLoadJson}
              className="hidden"
            />
            <UploadCloud className="h-5 w-5" />
            Importar JSON
          </label>

          {syncMessage && (
            <div className="inline-flex items-center gap-2 font-semibold text-[var(--green-dark)] sm:ml-auto">
              <Check className="w-5 h-5" />
              {syncMessage}
            </div>
          )}

        </div>

        <div className="mb-6 rounded-lg border border-[var(--surface-border)] bg-white p-4 shadow-[var(--surface-shadow)]">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all' as const, label: `Todos (${activeProperties.length})` },
                { value: 'listed' as const, label: `No site (${listedCount})` },
                { value: 'hidden' as const, label: `Ocultos (${hiddenCount})` },
                { value: 'trash' as const, label: `Lixeira (${recoveryProperties.length})` },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setStatusFilter(option.value)}
                  className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                    statusFilter === option.value
                      ? 'bg-[var(--green-dark)] text-white shadow'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <select
                value={adminTypeFilter}
                onChange={(event) => setAdminTypeFilter(event.target.value)}
                className={adminInputClass}
              >
                <option value="">Todos os tipos</option>
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <select
                value={adminRegionFilter}
                onChange={(event) => setAdminRegionFilter(event.target.value)}
                className={adminInputClass}
              >
                <option value="">Todas as regiões</option>
                {adminRegionOptions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>

              <select
                value={adminAvailabilityFilter}
                onChange={(event) =>
                  setAdminAvailabilityFilter(event.target.value as AdminAvailabilityFilter)
                }
                className={adminInputClass}
              >
                <option value="all">Todas disponibilidades</option>
                <option value="available">Disponíveis ({availableCount})</option>
                <option value="unavailable">Indisponíveis ({unavailableCount})</option>
              </select>
            </div>

            <div className="relative w-full">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                value={adminSearchQuery}
                onChange={(event) => setAdminSearchQuery(event.target.value)}
                className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-10 text-sm font-semibold outline-none focus:border-[var(--green-dark)]"
                placeholder="Buscar por ID, titulo, endereco..."
              />
              {adminSearchQuery && (
                <button
                  type="button"
                  onClick={() => setAdminSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  aria-label="Limpar busca"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* FORM */}
        {showForm && (
          <div
            ref={formRef}
            className={`scroll-mt-28 mb-8 overflow-hidden rounded-lg border border-[var(--surface-border)] bg-white shadow-[var(--surface-shadow-strong)] transition-all ${
              editingId !== null
                ? 'ring-2 ring-[var(--yellow)] ring-offset-2'
                : 'ring-1 ring-gray-100'
            }`}
          >
            <div className="border-b border-[var(--surface-border)] bg-white">
              <div className="border-l-4 border-[var(--green-dark)] px-5 py-5 md:px-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="mb-3 inline-flex items-center gap-2 rounded-md border border-[var(--surface-border)] bg-[var(--gray-light)] px-3 py-1 text-xs font-black uppercase tracking-wide text-[var(--green-dark)]">
                      <Building2 className="h-4 w-4" />
                      {editingId !== null ? `Editando #${editingId}` : 'Novo cadastro'}
                    </div>
                    <h2 className="text-3xl font-extrabold text-[var(--green-dark)]">
                      {editingId ? 'Editar Imóvel' : 'Novo Imóvel'}
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                      {editingId !== null
                        ? 'Altere os dados e clique em Atualizar Imovel.'
                        : 'Preencha os dados principais para criar um novo imovel.'}
                    </p>
                  </div>
                  <button
                    onClick={resetForm}
                    className="self-start rounded-full bg-[var(--gray-light)] p-2 text-[var(--green-dark)] hover:bg-[var(--green-light)] sm:self-auto"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 p-5 md:grid-cols-2 md:p-6">
              <h3 className="md:col-span-2 text-lg font-extrabold text-[var(--green-dark)]">
                Dados principais
              </h3>
              {/* TITLE */}
              <div>
                <AdminFieldLabel icon={FileText}>Título *</AdminFieldLabel>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className={adminInputClass}
                  placeholder="Ex: Studio 1 - NW10 2EL"
                />
              </div>

              {/* TYPE */}
              <div>
                <AdminFieldLabel icon={Building2}>Tipo *</AdminFieldLabel>
                <select
                  value={formData.category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className={adminInputClass}
                >
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* REGION */}
              <div>
                <AdminFieldLabel icon={MapPin}>Região</AdminFieldLabel>
                <input
                  type="text"
                  value={formData.region}
                  onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
                  className={adminInputClass}
                  placeholder="Ex: North London"
                />
              </div>

              {/* POSTCODE */}
              <div>
                <AdminFieldLabel icon={Navigation}>Postcode</AdminFieldLabel>
                <input
                  type="text"
                  value={formData.postcode}
                  onChange={(e) => setFormData(prev => ({ ...prev, postcode: e.target.value }))}
                  className={adminInputClass}
                  placeholder="Ex: NW10 2EL"
                />
              </div>

              {/* ADDRESS */}
              <div>
                <AdminFieldLabel icon={MapPin}>Endereço</AdminFieldLabel>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className={adminInputClass}
                  placeholder="Ex: 1 Meyrick Road NW10 2EL"
                />
              </div>

              {/* BEDROOMS */}
              <div>
                <AdminFieldLabel icon={BedDouble}>Quartos</AdminFieldLabel>
                <input
                  type="number"
                  value={formData.bedrooms || 0}
                  onChange={(e) => setFormData(prev => ({ ...prev, bedrooms: Number(e.target.value) }))}
                  className={adminInputClass}
                  min="0"
                />
              </div>

              {/* BATHROOMS */}
              <div>
                <AdminFieldLabel icon={Bath}>Banheiros</AdminFieldLabel>
                <input
                  type="number"
                  value={formData.bathrooms || 0}
                  onChange={(e) => setFormData(prev => ({ ...prev, bathrooms: Number(e.target.value) }))}
                  className={adminInputClass}
                  min="0"
                />
              </div>

              <h3 className="md:col-span-2 border-t border-[var(--surface-border)] pt-5 text-lg font-extrabold text-[var(--green-dark)]">
                Preço e disponibilidade
              </h3>

              {/* PRICE */}
              <div>
                <AdminFieldLabel icon={PoundSterling}>Preço</AdminFieldLabel>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_150px]">
                  <input
                    type="number"
                    value={getPriceValue(formData.price) || ''}
                    onChange={(e) => handlePriceAmountChange(e.target.value)}
                    className={adminInputClass}
                    min="0"
                    placeholder="350"
                  />
                  <select
                    value={getPricePeriod(formData.price)}
                    onChange={(e) => handlePricePeriodChange(e.target.value)}
                    className={adminInputClass}
                  >
                    {PRICE_PERIOD_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* DEPOSIT */}
              <div>
                <AdminFieldLabel icon={PoundSterling}>Depósito</AdminFieldLabel>
                <input
                  type="number"
                  value={formData.deposit || 0}
                  onChange={(e) => setFormData(prev => ({ ...prev, deposit: Number(e.target.value) }))}
                  className={adminInputClass}
                  min="0"
                />
              </div>

              {/* FURNISHING */}
              <div>
                <AdminFieldLabel icon={Home}>Mobiliado</AdminFieldLabel>
                <select
                  value={formData.furnishing}
                  onChange={(e) => setFormData(prev => ({ ...prev, furnishing: e.target.value }))}
                  className={adminInputClass}
                >
                  <option value="Mobiliado">Mobiliado</option>
                  <option value="Não Mobiliado">Não Mobiliado</option>
                  <option value="Parcialmente Mobiliado">Parcialmente Mobiliado</option>
                </select>
              </div>

              {/* MOVE IN DATE */}
              <div className="md:col-span-2">
                <AdminFieldLabel icon={CalendarDays}>Data de Entrada</AdminFieldLabel>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {MOVE_IN_OPTIONS.map((option) => (
                    <label
                      key={option}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                        formData.moveInDate === option
                          ? 'border-[var(--green-dark)] bg-[var(--green-light)] text-[var(--green-dark)]'
                          : 'border-gray-200 bg-white text-gray-800 hover:border-[var(--green-dark)] hover:bg-emerald-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="moveInDate"
                        checked={formData.moveInDate === option}
                        onChange={() => setFormData(prev => ({ ...prev, moveInDate: option }))}
                        className="h-4 w-4 accent-[var(--green-dark)]"
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </div>

              {/* PEOPLE */}
              <div>
                <AdminFieldLabel icon={Users}>Pessoas</AdminFieldLabel>
                <input
                  type="number"
                  value={formData.people || 1}
                  onChange={(e) => setFormData(prev => ({ ...prev, people: Number(e.target.value) }))}
                  className={adminInputClass}
                  min="1"
                />
              </div>

              <AdminSwitch
                checked={formData.available}
                label="Disponível"
                onChange={(checked) => setFormData(prev => ({ ...prev, available: checked }))}
              />

              <AdminSwitch
                checked={formData.listed !== false}
                label="Mostrar no site"
                onChange={(checked) => setFormData(prev => ({ ...prev, listed: checked }))}
              />

              <AdminSwitch
                checked={formData.billsIncluded}
                label="Bills inclusas"
                onChange={(checked) => setFormData(prev => ({ ...prev, billsIncluded: checked }))}
              />

            </div>

            <div className="border-t border-[var(--surface-border)] px-5 pt-6 md:px-6">
              <h3 className="text-lg font-extrabold text-[var(--green-dark)]">Descrição</h3>
            </div>

            {/* DESCRIPTION */}
            <div className="mt-4 px-5 md:px-6">
              <AdminFieldLabel icon={FileText}>Descrição</AdminFieldLabel>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className={`${adminTextAreaClass} h-20`}
                placeholder="Descrição curta"
              />
            </div>

            {/* LONG DESCRIPTION */}
            <div className="mt-4 px-5 md:px-6">
              <AdminFieldLabel icon={FileText}>Descrição Longa</AdminFieldLabel>
              <textarea
                value={formData.longDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, longDescription: e.target.value }))}
                className={`${adminTextAreaClass} h-28`}
                placeholder="Descrição detalhada"
              />
            </div>

            <div className="border-t border-[var(--surface-border)] px-5 pt-6 md:px-6">
              <h3 className="text-lg font-extrabold text-[var(--green-dark)]">Mídia</h3>
            </div>

            {/* IMAGES */}
            <div className="mt-4 px-5 md:px-6">
              <AdminFieldLabel icon={ImagePlus}>Imagens</AdminFieldLabel>
              <div className="mb-4 grid gap-2 md:grid-cols-[1fr_auto]">
                <input
                  type="text"
                  value={imageInput}
                  onChange={(e) => setImageInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddImage()}
                  className={adminInputClass}
                  placeholder="URL da imagem ou link compartilhado do Google Drive"
                />
                <button
                  type="button"
                  onClick={handleAddImage}
                  className="inline-flex items-center gap-2 rounded-lg bg-[var(--green-dark)] px-4 py-2 font-bold text-white hover:bg-[var(--green-medium)]"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar
                </button>
              </div>

              <div className="mb-4 rounded-lg border border-[var(--surface-border)] bg-[var(--gray-light)] p-3">
                <div className="grid gap-2 md:grid-cols-[1fr_auto_auto]">
                  <input
                    type="text"
                    value={storageImageSearch}
                    onChange={(e) => setStorageImageSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchStorageImages()}
                    className={adminInputClass}
                    placeholder="Buscar imagens no Supabase por nome, pasta ou imóvel"
                  />
                  <button
                    type="button"
                    onClick={handleSearchStorageImages}
                    disabled={isSearchingStorageImages}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2 font-bold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <Search className="h-4 w-4" />
                    {isSearchingStorageImages ? 'Buscando...' : 'Buscar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenStorageFolder(storageFolderPath)}
                    disabled={isLoadingStorageFolder}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--green-dark)] bg-white px-4 py-2 font-bold text-[var(--green-dark)] hover:bg-[var(--green-light)] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <FolderOpen className="h-4 w-4" />
                    {isLoadingStorageFolder ? 'Abrindo...' : 'Abrir pastas'}
                  </button>
                </div>

                {isStorageBrowserOpen && (
                  <div className="mt-3 rounded-lg border border-[var(--surface-border)] bg-white p-3">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenStorageFolder('')}
                        disabled={isLoadingStorageFolder}
                        className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-70"
                      >
                        <Home className="h-3.5 w-3.5" />
                        Raiz
                      </button>
                      <button
                        type="button"
                        onClick={handleBackStorageFolder}
                        disabled={!storageFolderPath || isLoadingStorageFolder}
                        className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Voltar
                      </button>
                      <button
                        type="button"
                        onClick={handleAddCurrentStorageFolder}
                        disabled={isLoadingStorageFolder}
                        className="rounded-md bg-[var(--green-dark)] px-3 py-1.5 text-xs font-bold text-white hover:bg-[var(--green-medium)] disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        Adicionar pasta inteira
                      </button>
                      <span className="min-w-0 flex-1 truncate text-xs font-bold text-gray-600">
                        {storageFolderPath || 'property-images'}
                      </span>
                    </div>

                    {storageFolders.length > 0 && (
                      <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {storageFolders.map((folder) => (
                          <button
                            key={folder.path}
                            type="button"
                            onClick={() => handleOpenStorageFolder(folder.path)}
                            disabled={isLoadingStorageFolder}
                            className="flex min-w-0 items-center gap-2 rounded-lg border border-gray-200 bg-[var(--gray-light)] px-3 py-2 text-left text-sm font-bold text-gray-800 hover:border-[var(--green-dark)] hover:bg-[var(--green-light)] disabled:opacity-70"
                          >
                            <FolderOpen className="h-4 w-4 shrink-0 text-[var(--green-dark)]" />
                            <span className="truncate">{folder.name}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {storageFolderImages.length > 0 ? (
                      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                        {storageFolderImages.map((item) => {
                          const isAdded = formData.images.includes(item.url);

                          return (
                            <div
                              key={item.path}
                              className="overflow-hidden rounded-lg border border-[var(--surface-border)] bg-white"
                            >
                              <ImageWithFallback
                                src={item.url}
                                className="h-24 w-full object-cover"
                              />
                              <div className="p-2">
                                <p
                                  className="mb-2 truncate text-[11px] font-semibold text-gray-600"
                                  title={item.path}
                                >
                                  {item.name}
                                </p>
                                <button
                                  type="button"
                                  onClick={() => handleAddStorageImage(item.url)}
                                  disabled={isAdded}
                                  className={`w-full rounded-md px-2 py-1.5 text-xs font-bold ${
                                    isAdded
                                      ? 'bg-[var(--green-light)] text-[var(--green-dark)]'
                                      : 'bg-[var(--green-dark)] text-white hover:bg-[var(--green-medium)]'
                                  }`}
                                >
                                  {isAdded ? 'Adicionada' : 'Adicionar'}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      storageFolders.length === 0 &&
                      !isLoadingStorageFolder && (
                        <p className="rounded-lg bg-[var(--gray-light)] px-3 py-3 text-sm font-semibold text-gray-600">
                          Nenhuma pasta ou imagem encontrada aqui.
                        </p>
                      )
                    )}
                  </div>
                )}

                {storageImageResults.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
                    {storageImageResults.map((item) => {
                      const isAdded = formData.images.includes(item.url);

                      return (
                        <div
                          key={item.path}
                          className="overflow-hidden rounded-lg border border-[var(--surface-border)] bg-white"
                        >
                          <ImageWithFallback
                            src={item.url}
                            className="h-24 w-full object-cover"
                          />
                          <div className="p-2">
                            <p
                              className="mb-2 truncate text-[11px] font-semibold text-gray-600"
                              title={item.path}
                            >
                              {item.path}
                            </p>
                            <button
                              type="button"
                              onClick={() => handleAddStorageImage(item.url)}
                              disabled={isAdded}
                              className={`w-full rounded-md px-2 py-1.5 text-xs font-bold ${
                                isAdded
                                  ? 'bg-[var(--green-light)] text-[var(--green-dark)]'
                                  : 'bg-[var(--green-dark)] text-white hover:bg-[var(--green-medium)]'
                              }`}
                            >
                              {isAdded ? 'Adicionada' : 'Adicionar'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {formData.images.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <ImageWithFallback
                      src={img}
                      className="w-full h-24 object-cover rounded-lg border border-[var(--surface-border)]"
                    />
                    {formData.image === img && (
                      <span className="absolute left-2 top-2 rounded-full bg-[var(--yellow)] px-2 py-1 text-[10px] font-black text-black">
                        Capa
                      </span>
                    )}
                    {formData.image !== img && (
                      <button
                        type="button"
                        onClick={() => handleSetCoverImage(idx)}
                        className="absolute bottom-2 left-2 right-2 rounded-md bg-white/95 px-2 py-1 text-xs font-bold text-[var(--green-dark)] opacity-0 shadow transition group-hover:opacity-100"
                      >
                        Usar como capa
                      </button>
                    )}
                    <button
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* VIDEO */}
            <div className="mt-6 px-5 md:px-6">
              <AdminFieldLabel icon={Video}>Vídeo (URL)</AdminFieldLabel>
              <div className="grid gap-2 md:grid-cols-[1fr_auto]">
                <input
                  type="text"
                  value={formData.video || ''}
                  onChange={(e) => handleVideoUrlChange(e.target.value)}
                  onBlur={handleVideoUrlBlur}
                  className={adminInputClass}
                  placeholder="URL do vídeo, YouTube ou link compartilhado do Google Drive"
                />
                <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-[var(--green-dark)] bg-white px-4 py-2 font-bold text-[var(--green-dark)] hover:bg-[var(--green-light)]">
                  <UploadCloud className="h-4 w-4" />
                  {isUploadingVideo ? 'Enviando...' : 'Upload vídeo'}
                  <input
                    type="file"
                    accept="video/*"
                    disabled={isUploadingVideo}
                    onChange={handleUploadVideo}
                    className="sr-only"
                  />
                </label>
              </div>
            </div>

            {/* AMENITIES */}
            <div className="mt-6 px-5 md:px-6">
              <AdminFieldLabel icon={ListChecks}>Comodidades</AdminFieldLabel>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {visibleAmenityOptions.map((amenity) => (
                  <label
                    key={amenity}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-800 transition hover:border-[var(--green-dark)] hover:bg-emerald-50"
                  >
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => handleToggleAmenity(amenity)}
                      className="h-4 w-4 accent-[var(--green-dark)]"
                    />
                    {amenity}
                  </label>
                ))}
              </div>
            </div>

            {/* NEARBY STATIONS */}
            <div className="mt-6 px-5 md:px-6">
              <AdminFieldLabel icon={Train}>Estações Próximas</AdminFieldLabel>
              <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
                {STATION_SUGGESTIONS.map((station) => (
                  <button
                    key={station}
                    type="button"
                    onClick={() => handleAddSuggestedStation(station)}
                    className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                      formData.nearbyStations.includes(station)
                        ? 'border-[var(--green-dark)] bg-[var(--green-light)] text-[var(--green-dark)]'
                        : 'border-[var(--surface-border)] bg-white text-gray-700 hover:border-[var(--green-dark)]'
                    }`}
                  >
                    {station.replace(' Station', '')}
                  </button>
                ))}
              </div>
              <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
                <div>
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={stationInput}
                      onChange={(e) => setStationInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddStation()}
                      className={adminInputClass}
                      placeholder="Ex: Dollis Hill Station"
                    />
                    <button
                      onClick={handleAddStation}
                      className="inline-flex items-center gap-2 rounded-lg bg-[var(--green-dark)] px-4 py-2 font-bold text-white hover:bg-[var(--green-medium)]"
                    >
                      <Plus className="h-4 w-4" />
                      Adicionar
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {formData.nearbyStations.map((station, idx) => (
                      <div key={idx} className="flex items-center gap-2 rounded-full bg-[var(--gray-light)] px-3 py-1">
                        <span>{station}</span>
                        <button
                          onClick={() => handleRemoveStation(idx)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="overflow-hidden rounded-lg border border-[var(--surface-border)] bg-white shadow-[var(--surface-shadow)]">
                  <iframe
                    title="Mapa para consultar estações próximas"
                    src={stationMapUrl}
                    className="h-44 w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                  <a
                    href={stationSearchUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 border-t border-[var(--surface-border)] bg-[var(--gray-light)] px-3 py-2 text-sm font-bold text-[var(--green-dark)] hover:bg-[var(--green-light)]"
                  >
                    <MapPin className="h-4 w-4" />
                    Ver estações no mapa
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-[var(--surface-border)] px-5 pt-6 md:px-6">
              <h3 className="mb-4 text-lg font-extrabold text-[var(--green-dark)]">Pré-visualização</h3>
              <div className="max-w-md overflow-hidden rounded-lg border border-[var(--surface-border)] bg-white shadow-[var(--surface-shadow)]">
                <div className="h-40 bg-[var(--gray-light)]">
                  {formData.image ? (
                    <ImageWithFallback
                      src={formData.image}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm font-bold text-gray-500">
                      Imagem de capa
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="rounded-full bg-[var(--green-light)] px-3 py-1 text-xs font-bold text-[var(--green-dark)]">
                      {getCategoryLabel(formData.category)}
                    </span>
                    <span className="text-sm font-bold text-[var(--green-dark)]">
                      {formatEuroPrice(formData.price)}
                    </span>
                  </div>
                  <h4 className="line-clamp-2 text-lg font-extrabold text-gray-900">
                    {formData.title || 'Título do imóvel'}
                  </h4>
                  <p className="mt-1 text-sm text-gray-600">
                    {formData.region || 'Região'} {formData.postcode ? `- ${formData.postcode}` : ''}
                  </p>
                  <p className="mt-3 line-clamp-2 text-sm text-gray-600">
                    {formData.description || 'Descrição curta do imóvel.'}
                  </p>
                </div>
              </div>
            </div>

            {/* SAVE BUTTON */}
            <div className="mt-8 flex flex-col gap-3 border-t border-[var(--surface-border)] bg-[var(--gray-light)] p-5 sm:flex-row md:p-6">
              <button
                onClick={handleSaveProperty}
                className="flex items-center justify-center gap-2 rounded-lg bg-[var(--green-dark)] px-6 py-3 font-bold text-white hover:bg-[var(--green-medium)]"
              >
                <Save className="w-5 h-5" />
                {editingId ? 'Atualizar' : 'Criar'} Imóvel
              </button>
              <button
                onClick={resetForm}
                className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-bold text-gray-700 hover:bg-gray-100"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* PROPERTIES LIST */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleAdminProperties.map((property) => (
            <div
              key={property.id}
              className={`overflow-hidden rounded-lg border border-[var(--surface-border)] bg-white shadow-[var(--surface-shadow)] transition hover:shadow-[var(--surface-shadow-strong)] ${
                isInRecovery(property)
                  ? 'ring-2 ring-red-100'
                  : property.listed === false
                    ? 'opacity-75 ring-2 ring-gray-200'
                    : ''
              }`}
            >
              <div className="relative h-40 overflow-hidden">
                <ImageWithFallback
                  src={property.image}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 bg-[var(--green-dark)] text-white px-3 py-1 rounded-full text-xs font-bold">
                  #{property.id}
                </div>
                <div
                  className={`absolute top-2 right-2 rounded-full px-3 py-1 text-xs font-bold shadow ${
                    isInRecovery(property)
                      ? 'bg-red-50 text-red-700'
                      : property.listed === false
                      ? 'bg-gray-900 text-white'
                      : 'bg-[var(--green-light)] text-[var(--green-dark)]'
                  }`}
                >
                  {isInRecovery(property)
                    ? `${getRecoveryDaysLeft(property)} dias`
                    : property.listed === false ? 'Oculto' : 'No site'}
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-bold text-lg mb-1 truncate">{property.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{property.region}</p>

                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-[var(--green-dark)]">{formatEuroPrice(property.price)}</span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">{property.category}</span>
                </div>

                {isInRecovery(property) ? (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleRestoreProperty(property)}
                      className="rounded-lg bg-[var(--green-dark)] py-2 text-sm font-semibold text-white hover:bg-[var(--green-medium)]"
                    >
                      Restaurar
                    </button>
                    <button
                      onClick={() => handlePermanentDeleteProperty(property)}
                      className="flex items-center justify-center gap-1 rounded-lg border border-red-200 bg-white py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      Excluir
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleToggleListed(property)}
                      className={`col-span-2 flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold ${
                        property.listed === false
                          ? 'bg-[var(--green-dark)] text-white hover:bg-[var(--green-medium)]'
                          : 'bg-gray-900 text-white hover:bg-gray-800'
                      }`}
                    >
                      {property.listed === false ? (
                        <>
                          <Eye className="h-4 w-4" />
                          Ativar no site
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-4 w-4" />
                          Ocultar do site
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleEditProperty(property)}
                      className="flex-1 rounded-lg border border-[var(--green-dark)] bg-white py-2 text-sm font-semibold text-[var(--green-dark)] hover:bg-[var(--green-dark)] hover:text-white"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleConfirmDeleteProperty(property)}
                      className="flex-1 border border-red-200 bg-white py-2 rounded-lg font-semibold text-red-700 hover:bg-red-50 text-sm flex items-center justify-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      Deletar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {adminPropertiesForStatus.length > 0 && visibleAdminProperties.length === 0 && !showForm && (
          <div className="py-12 text-center">
            <p className="mb-4 text-gray-600">Nenhum imovel encontrado com esses filtros</p>
            <button
              onClick={() => {
                setStatusFilter('all');
                setAdminTypeFilter('');
                setAdminRegionFilter('');
                setAdminAvailabilityFilter('all');
                setAdminSearchQuery('');
              }}
              className="rounded-lg bg-[var(--green-dark)] px-6 py-3 font-bold text-white"
            >
              Limpar filtros
            </button>
          </div>
        )}

        {activeProperties.length === 0 && statusFilter !== 'trash' && !showForm && (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">Nenhum imóvel adicionado ainda</p>
            <button
              onClick={() => {
                openNewPropertyForm();
              }}
              className="bg-[var(--green-dark)] text-white px-6 py-3 rounded-lg font-bold"
            >
              Criar Primeiro Imóvel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
