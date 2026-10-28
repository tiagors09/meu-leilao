const DEFAULT_API_BASE_URL = 'https://dummyjson.com';

export class ItemService {
  constructor({
    itemRepository,
    httpClient,
    apiBaseUrl = DEFAULT_API_BASE_URL,
    timeoutMs = 5000,
  }) {
    if (!itemRepository || typeof httpClient !== 'function') {
      throw new Error('As dependencias do catalogo externo sao obrigatorias.');
    }

    this.itemRepository = itemRepository;
    this.httpClient = httpClient;
    this.apiBaseUrl = apiBaseUrl;
    this.timeoutMs = timeoutMs;
  }

  async search(query) {
    const normalizedQuery = typeof query === 'string' ? query.trim() : '';
    if (!normalizedQuery) {
      throw this.createError('Informe um termo para buscar itens.', 400);
    }

    try {
      const searchUrl = new URL('/products/search', this.apiBaseUrl);
      searchUrl.searchParams.set('q', normalizedQuery);
      const response = await this.httpClient(searchUrl, {
        signal: AbortSignal.timeout(this.timeoutMs),
      });

      if (!response.ok) {
        throw new Error('A API externa retornou uma resposta invalida.');
      }

      const payload = await response.json();
      const products = Array.isArray(payload.products) ? payload.products : [];
      const normalizedItems = products
        .filter((product) => product.id !== undefined && product.title)
        .map((product) => ({
          externalId: String(product.id),
          title: String(product.title),
          imageUrl: product.thumbnail ?? product.images?.[0] ?? null,
          rawPayload: product,
        }));

      const items = normalizedItems.length > 0
        ? await this.itemRepository.upsertMany(normalizedItems)
        : [];

      return { items, source: 'external' };
    } catch {
      const items = await this.itemRepository.searchCached(normalizedQuery);
      if (items.length === 0) {
        throw this.createError(
          'Catalogo externo indisponivel e nao ha itens correspondentes no cache.',
          503,
        );
      }

      return { items, source: 'cache' };
    }
  }

  createError(message, statusCode) {
    return Object.assign(new Error(message), { statusCode });
  }
}
