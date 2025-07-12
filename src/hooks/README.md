# Sistema de Loading Reutilizável

Este documento descreve como usar o novo sistema de loading reutilizável implementado no projeto.

## Visão Geral

O sistema foi criado para eliminar a repetição de lógica de loading entre componentes e fornecer uma experiência consistente de carregamento em toda a aplicação.

## Componentes Principais

### 1. Hook `useLoading`

O hook `useLoading` centraliza a lógica de gerenciamento de estados de loading.

```javascript
import { useLoading } from "@/hooks/useLoading";

const {
  isPageLoading,
  isContentLoading,
  isDataLoading,
  withPageLoading,
  withContentLoading,
  withDataLoading,
} = useLoading({
  initialPageLoading: true,
  initialContentLoading: false,
  initialDataLoading: false,
});
```

#### Estados Disponíveis

- `isPageLoading`: Para carregamento inicial da página
- `isContentLoading`: Para carregamento de mudança de conteúdo
- `isDataLoading`: Para carregamento de dados específicos

#### Funções Utilitárias

- `withPageLoading(operation)`: Executa uma operação com loading de página
- `withContentLoading(operation)`: Executa uma operação com loading de conteúdo
- `withDataLoading(operation)`: Executa uma operação com loading de dados

### 2. Componentes de Loading

#### PageLoader

Para carregamento de página inteira:

```javascript
import { PageLoader } from "@/components/ui/loading";

<PageLoader message="Carregando dashboard..." />;
```

#### ContentLoader

Para carregamento de conteúdo específico:

```javascript
import { ContentLoader } from "@/components/ui/loading";

<ContentLoader message="Carregando conteúdo..." />;
```

#### DataLoader

Para carregamento de dados em tabelas/cards:

```javascript
import { DataLoader } from "@/components/ui/loading";

<DataLoader message="Carregando medicamentos..." />;
```

#### LoadingWrapper

Componente condicional que renderiza o conteúdo quando não está carregando:

```javascript
import { LoadingWrapper, DataLoader } from "@/components/ui/loading";

<LoadingWrapper
  isLoading={isDataLoading}
  loadingComponent={<DataLoader message="Carregando..." />}
>
  {/* Seu conteúdo aqui */}
</LoadingWrapper>;
```

## Exemplos de Uso

### Exemplo 1: Dashboard Principal

```javascript
// Antes (repetição de lógica)
const [isPageLoading, setIsPageLoading] = useState(true);
const [isContentLoading, setIsContentLoading] = useState(false);

// Depois (usando o hook)
const { isPageLoading, isContentLoading, withPageLoading, withContentLoading } =
  useLoading({
    initialPageLoading: true,
    initialContentLoading: false,
  });

// Carregamento inicial
useEffect(() => {
  const initializeDashboard = async () => {
    await withPageLoading(async () => {
      await Promise.all([
        refreshAlerts(),
        new Promise((resolve) => setTimeout(resolve, 500)),
      ]);
    });
  };
  initializeDashboard();
}, [withPageLoading]);

// Mudança de conteúdo
const handleContentChange = useCallback(
  async (title) => {
    await withContentLoading(async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setCurrentContent(title);
    });
  },
  [withContentLoading]
);
```

### Exemplo 2: Componente de Tabela

```javascript
// Antes
const [loading, setLoading] = useState(true);

const fetchData = async () => {
  try {
    setLoading(true);
    const data = await api.getData();
    setData(data);
  } finally {
    setLoading(false);
  }
};

// Depois
const { isDataLoading, withDataLoading } = useLoading({
  initialDataLoading: true,
});

const fetchData = async () => {
  await withDataLoading(async () => {
    const data = await api.getData();
    setData(data);
  });
};

// Renderização
return (
  <LoadingWrapper
    isLoading={isDataLoading}
    loadingComponent={<DataLoader message="Carregando dados..." />}
  >
    {/* Seu conteúdo aqui */}
  </LoadingWrapper>
);
```

## Benefícios

1. **Eliminação de Repetição**: Não há mais necessidade de repetir a lógica de loading em cada componente
2. **Consistência**: Todos os componentes usam o mesmo padrão de loading
3. **Manutenibilidade**: Mudanças no sistema de loading são aplicadas globalmente
4. **Flexibilidade**: Diferentes tipos de loading para diferentes contextos
5. **Performance**: Estados de loading são gerenciados de forma otimizada

## Migração de Componentes Existentes

Para migrar um componente existente:

1. **Importe o hook e componentes**:

```javascript
import { useLoading } from "@/hooks/useLoading";
import { LoadingWrapper, DataLoader } from "@/components/ui/loading";
```

2. **Substitua os estados de loading**:

```javascript
// Antes
const [loading, setLoading] = useState(true);

// Depois
const { isDataLoading, withDataLoading } = useLoading({
  initialDataLoading: true,
});
```

3. **Atualize as funções de carregamento**:

```javascript
// Antes
const fetchData = async () => {
  try {
    setLoading(true);
    // lógica
  } finally {
    setLoading(false);
  }
};

// Depois
const fetchData = async () => {
  await withDataLoading(async () => {
    // lógica
  });
};
```

4. **Aplique o LoadingWrapper**:

```javascript
return (
  <LoadingWrapper
    isLoading={isDataLoading}
    loadingComponent={<DataLoader message="Carregando..." />}
  >
    {/* conteúdo */}
  </LoadingWrapper>
);
```

## Componentes Migrados

- ✅ `Dashboard` (página principal)
- ✅ `TableContent` (tabela de medicamentos)
- ✅ `Reservation` (gerenciamento de reservas)

## Próximos Passos

- [ ] Migrar `PharmacyManagement`
- [ ] Migrar `EmployeeManagement`
- [ ] Migrar `ExportReports`
- [ ] Migrar componentes de modais
- [ ] Adicionar testes para o sistema de loading
