import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Property } from '../data/properties';
import { Plus, Trash2, Download, Save, X, Check, Cloud, AlertCircle } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import {
  deletePropertyFromSupabase,
  hasSupabaseConfig,
  loadPropertiesFromSupabase,
  replacePropertiesInSupabase,
  savePropertyToSupabase,
} from '../data/supabaseProperties';

const INITIAL_FORM: Omit<Property, 'id'> = {
  image: '',
  images: [],
  video: '',
  type: '',
  title: '',
  region: '',
  price: '',
  description: '',
  longDescription: '',
  available: true,
  billsIncluded: false,
  bedrooms: 1,
  bathrooms: 0,
  category: 'studio',
  amenities: [],
  deposit: 0,
  nearbyStations: [],
  coordinates: { lat: 0, lng: 0 },
  furnishing: 'Mobiliado',
  moveInDate: 'Imediata',
  postcode: '',
  address: '',
  people: 1,
};

export function AdminPage() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [syncMessage, setSyncMessage] = useState('');
  const [syncError, setSyncError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Omit<Property, 'id'>>(INITIAL_FORM);
  const [imageInput, setImageInput] = useState('');
  const [amenityInput, setAmenityInput] = useState('');
  const [stationInput, setStationInput] = useState('');

  // Carregar somente do Supabase para evitar dados locais desatualizados.
  useEffect(() => {
    const loadProperties = async () => {
      if (!hasSupabaseConfig()) {
        setProperties([]);
        setSyncError('Supabase nao configurado');
        return;
      }

      try {
        const remoteProperties = await loadPropertiesFromSupabase();
        setProperties(remoteProperties);
        setSyncError('');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro ao sincronizar com Supabase';
        setProperties([]);
        setSyncError(message);
      }
    };

    void loadProperties();
  }, []);

  const nextId = Math.max(0, ...properties.map(p => p.id)) + 1;

  const handleAddImage = () => {
    if (imageInput.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, imageInput.trim()],
        image: prev.image || imageInput.trim()
      }));
      setImageInput('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => {
      const newImages = prev.images.filter((_, i) => i !== index);
      return {
        ...prev,
        images: newImages,
        image: newImages[0] || prev.image
      };
    });
  };

  const handleAddAmenity = () => {
    if (amenityInput.trim()) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, amenityInput.trim()]
      }));
      setAmenityInput('');
    }
  };

  const handleRemoveAmenity = (index: number) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index)
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

    const propertyToSave: Property = {
      ...formData,
      id: editingId !== null ? editingId : nextId,
    };

    try {
      if (!hasSupabaseConfig()) {
        throw new Error('Supabase nao configurado');
      }

      const savedProperty = await savePropertyToSupabase(propertyToSave);

      setProperties((prev) =>
        editingId !== null
          ? prev.map((property) =>
              property.id === editingId ? savedProperty : property
            )
          : [...prev, savedProperty]
      );

      setSyncMessage('✓ Imóvel salvo online no Supabase');

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
    setFormData(rest);
    setEditingId(id);
    setShowForm(true);
  };

  const handleDeleteProperty = async (id: number) => {
    if (!confirm('Deseja deletar este imóvel?')) {
      return;
    }

    try {
      if (!hasSupabaseConfig()) {
        throw new Error('Supabase nao configurado');
      }

      await deletePropertyFromSupabase(id);

      setProperties((prev) => prev.filter((property) => property.id !== id));
      setSyncError('');
      setSyncMessage('✓ Imóvel removido com sucesso');
      setTimeout(() => setSyncMessage(''), 3000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao deletar imóvel';
      setSyncError(message);
      alert(message);
    }
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM);
    setImageInput('');
    setAmenityInput('');
    setStationInput('');
    setEditingId(null);
    setShowForm(false);
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
    setSyncMessage('✓ JSON exportado com sucesso!');
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

        if (!hasSupabaseConfig()) {
          throw new Error('Supabase nao configurado');
        }

        const savedProperties = await replacePropertiesInSupabase(data);
        setProperties(savedProperties);
        setSyncMessage('✓ JSON importado e publicado no Supabase');
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

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin - Gerenciar Imóveis</h1>
          <p className="text-gray-600">Adicione, edite ou remova propriedades</p>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 font-semibold text-gray-700 shadow-sm">
              <Cloud className="h-4 w-4" />
              Fonte ativa: Supabase
            </span>

            {syncError && (
              <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 font-semibold text-red-700">
                <AlertCircle className="h-4 w-4" />
                {syncError}
              </span>
            )}
          </div>
        </div>

        {/* ACTIONS */}
        <div className="mb-6 flex flex-wrap gap-3">
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="inline-flex items-center gap-2 bg-[var(--green-dark)] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[var(--green-medium)]"
          >
            <Plus className="w-5 h-5" />
            Novo Imóvel
          </button>

          <button
            onClick={handleDownloadJson}
            className="inline-flex items-center gap-2 border border-[var(--green-dark)] text-[var(--green-dark)] px-4 py-2 rounded-lg font-semibold hover:bg-[var(--green-dark)] hover:text-white"
          >
            <Download className="w-5 h-5" />
            Exportar JSON
          </button>

          <label className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 cursor-pointer">
            <input
              type="file"
              accept=".json"
              onChange={handleLoadJson}
              className="hidden"
            />
            Importar JSON
          </label>

          {syncMessage && (
            <div className="ml-auto inline-flex items-center gap-2 text-green-600 font-semibold">
              <Check className="w-5 h-5" />
              {syncMessage}
            </div>
          )}

          <button
            onClick={() => navigate('/properties')}
            className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 ml-auto"
          >
            Voltar
          </button>
        </div>

        {/* FORM */}
        {showForm && (
          <div className="mb-8 bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingId ? 'Editar Imóvel' : 'Novo Imóvel'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* TITLE */}
              <div>
                <label className="block text-sm font-bold mb-2">Título *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Ex: Studio 1 - NW10 2EL"
                />
              </div>

              {/* TYPE */}
              <div>
                <label className="block text-sm font-bold mb-2">Tipo *</label>
                <input
                  type="text"
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Ex: Studio, Single Room, 2 Bedroom Flat"
                />
              </div>

              {/* CATEGORY */}
              <div>
                <label className="block text-sm font-bold mb-2">Categoria</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="studio">Studio</option>
                  <option value="ensuite">Ensuite</option>
                  <option value="single">Single</option>
                  <option value="double">Double</option>
                  <option value="flat">Flat</option>
                </select>
              </div>

              {/* REGION */}
              <div>
                <label className="block text-sm font-bold mb-2">Região</label>
                <input
                  type="text"
                  value={formData.region}
                  onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Ex: North London"
                />
              </div>

              {/* POSTCODE */}
              <div>
                <label className="block text-sm font-bold mb-2">Postcode</label>
                <input
                  type="text"
                  value={formData.postcode}
                  onChange={(e) => setFormData(prev => ({ ...prev, postcode: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Ex: NW10 2EL"
                />
              </div>

              {/* ADDRESS */}
              <div>
                <label className="block text-sm font-bold mb-2">Endereço</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Ex: 1 Meyrick Road NW10 2EL"
                />
              </div>

              {/* BEDROOMS */}
              <div>
                <label className="block text-sm font-bold mb-2">Quartos</label>
                <input
                  type="number"
                  value={formData.bedrooms || 0}
                  onChange={(e) => setFormData(prev => ({ ...prev, bedrooms: Number(e.target.value) }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  min="0"
                />
              </div>

              {/* BATHROOMS */}
              <div>
                <label className="block text-sm font-bold mb-2">Banheiros</label>
                <input
                  type="number"
                  value={formData.bathrooms || 0}
                  onChange={(e) => setFormData(prev => ({ ...prev, bathrooms: Number(e.target.value) }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  min="0"
                />
              </div>

              {/* PRICE */}
              <div>
                <label className="block text-sm font-bold mb-2">Preço</label>
                <input
                  type="text"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Ex: £350/week"
                />
              </div>

              {/* DEPOSIT */}
              <div>
                <label className="block text-sm font-bold mb-2">Depósito</label>
                <input
                  type="number"
                  value={formData.deposit || 0}
                  onChange={(e) => setFormData(prev => ({ ...prev, deposit: Number(e.target.value) }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  min="0"
                />
              </div>

              {/* FURNISHING */}
              <div>
                <label className="block text-sm font-bold mb-2">Mobiliado</label>
                <select
                  value={formData.furnishing}
                  onChange={(e) => setFormData(prev => ({ ...prev, furnishing: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="Mobiliado">Mobiliado</option>
                  <option value="Não Mobiliado">Não Mobiliado</option>
                  <option value="Parcialmente Mobiliado">Parcialmente Mobiliado</option>
                </select>
              </div>

              {/* MOVE IN DATE */}
              <div>
                <label className="block text-sm font-bold mb-2">Data de Entrada</label>
                <input
                  type="text"
                  value={formData.moveInDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, moveInDate: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Ex: Imediata ou 30/05/2026"
                />
              </div>

              {/* PEOPLE */}
              <div>
                <label className="block text-sm font-bold mb-2">Pessoas</label>
                <input
                  type="number"
                  value={formData.people || 1}
                  onChange={(e) => setFormData(prev => ({ ...prev, people: Number(e.target.value) }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  min="1"
                />
              </div>

              {/* AVAILABLE */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold">
                  <input
                    type="checkbox"
                    checked={formData.available}
                    onChange={(e) => setFormData(prev => ({ ...prev, available: e.target.checked }))}
                  />
                  Disponível
                </label>
              </div>

              {/* BILLS INCLUDED */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold">
                  <input
                    type="checkbox"
                    checked={formData.billsIncluded}
                    onChange={(e) => setFormData(prev => ({ ...prev, billsIncluded: e.target.checked }))}
                  />
                  Bills Inclusas
                </label>
              </div>

              {/* COORDINATES */}
              <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Latitude</label>
                  <input
                    type="number"
                    value={formData.coordinates.lat || 0}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      coordinates: { ...prev.coordinates, lat: Number(e.target.value) }
                    }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    step="0.001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Longitude</label>
                  <input
                    type="number"
                    value={formData.coordinates.lng || 0}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      coordinates: { ...prev.coordinates, lng: Number(e.target.value) }
                    }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    step="0.001"
                  />
                </div>
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="mt-6">
              <label className="block text-sm font-bold mb-2">Descrição</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 h-20"
                placeholder="Descrição curta"
              />
            </div>

            {/* LONG DESCRIPTION */}
            <div className="mt-4">
              <label className="block text-sm font-bold mb-2">Descrição Longa</label>
              <textarea
                value={formData.longDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, longDescription: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 h-28"
                placeholder="Descrição detalhada"
              />
            </div>

            {/* IMAGES */}
            <div className="mt-6">
              <label className="block text-sm font-bold mb-3">Imagens</label>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={imageInput}
                  onChange={(e) => setImageInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddImage()}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="URL da imagem"
                />
                <button
                  onClick={handleAddImage}
                  className="bg-[var(--green-dark)] text-white px-4 py-2 rounded-lg font-semibold"
                >
                  Adicionar
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {formData.images.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <ImageWithFallback
                      src={img}
                      className="w-full h-24 object-cover rounded-lg border border-gray-300"
                    />
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
            <div className="mt-6">
              <label className="block text-sm font-bold mb-2">Vídeo (URL)</label>
              <input
                type="text"
                value={formData.video || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, video: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="URL do vídeo (Google Drive ou YouTube)"
              />
            </div>

            {/* AMENITIES */}
            <div className="mt-6">
              <label className="block text-sm font-bold mb-3">Comodidades</label>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={amenityInput}
                  onChange={(e) => setAmenityInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddAmenity()}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Ex: Wi-Fi, Mobiliado"
                />
                <button
                  onClick={handleAddAmenity}
                  className="bg-[var(--green-dark)] text-white px-4 py-2 rounded-lg font-semibold"
                >
                  Adicionar
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.amenities.map((amenity, idx) => (
                  <div key={idx} className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-2">
                    <span>{amenity}</span>
                    <button
                      onClick={() => handleRemoveAmenity(idx)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* NEARBY STATIONS */}
            <div className="mt-6">
              <label className="block text-sm font-bold mb-3">Estações Próximas</label>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={stationInput}
                  onChange={(e) => setStationInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddStation()}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Ex: Central Station"
                />
                <button
                  onClick={handleAddStation}
                  className="bg-[var(--green-dark)] text-white px-4 py-2 rounded-lg font-semibold"
                >
                  Adicionar
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.nearbyStations.map((station, idx) => (
                  <div key={idx} className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-2">
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

            {/* SAVE BUTTON */}
            <div className="mt-8 flex gap-3">
              <button
                onClick={handleSaveProperty}
                className="flex items-center gap-2 bg-[var(--green-dark)] text-white px-6 py-3 rounded-lg font-bold hover:bg-[var(--green-medium)]"
              >
                <Save className="w-5 h-5" />
                {editingId ? 'Atualizar' : 'Criar'} Imóvel
              </button>
              <button
                onClick={resetForm}
                className="px-6 py-3 border border-gray-300 rounded-lg font-bold text-gray-700 hover:bg-gray-100"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* PROPERTIES LIST */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <div key={property.id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition">
              <div className="relative h-40 overflow-hidden">
                <ImageWithFallback
                  src={property.image}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 bg-[var(--green-dark)] text-white px-3 py-1 rounded-full text-xs font-bold">
                  #{property.id}
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-bold text-lg mb-1 truncate">{property.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{property.region}</p>

                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-[var(--green-dark)]">{property.price}</span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">{property.category}</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditProperty(property)}
                    className="flex-1 bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 text-sm"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteProperty(property.id)}
                    className="flex-1 bg-red-500 text-white py-2 rounded-lg font-semibold hover:bg-red-600 text-sm flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    Deletar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {properties.length === 0 && !showForm && (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">Nenhum imóvel adicionado ainda</p>
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
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
