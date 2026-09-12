import { createSignal } from 'solid-js';
import { Squircle } from '../components/Squircle';
import { ContactPreview } from '../components/ContactPreview';
import { 
  MagnifyingGlassIcon, 
  PlusIcon, 
  UserIcon, 
  PhoneIcon, 
  MapPinIcon, 
  TrashIcon, 
  CaretCircleRightIcon,
  XIcon
} from '../components/Icons';
import { Button } from '../components/Button';
import { 
  contacts, 
  selectedContactId, 
  setSelectedContactId, 
  searchQuery, 
  setSearchQuery, 
  addContact, 
  removeContact, 
  formatarTelefone 
} from '../contactsStore';
import { isTablet } from '../viewport';

export function ContactsPage() {
  const [isCreating, setIsCreating] = createSignal(false);
  const [searchOpen, setSearchOpen] = createSignal(false);

  // Campos do formulário de novo contato
  const [newName, setNewName] = createSignal('');
  const [newPhone, setNewPhone] = createSignal('');
  const [newAddress, setNewAddress] = createSignal('');
  const [newObs, setNewObs] = createSignal('');

  const filteredContacts = () => {
    const q = searchQuery().trim().toLowerCase();
    if (!q) return contacts();
    return contacts().filter(
      (c) =>
        c.nome.toLowerCase().includes(q) ||
        c.tel.toLowerCase().includes(q) ||
        c.endereco.toLowerCase().includes(q)
    );
  };

  const selectedContact = () => {
    const id = selectedContactId();
    return contacts().find((c) => c.id === id) || null;
  };

  const handleCreateContact = (e?: Event) => {
    if (e) e.preventDefault();
    if (!newName().trim()) return;

    addContact({
      nome: newName().trim(),
      tel: newPhone().trim(),
      endereco: newAddress().trim(),
      obs: newObs().trim()
    });

    // Limpa campos e fecha tela de criação
    setNewName('');
    setNewPhone('');
    setNewAddress('');
    setNewObs('');
    setIsCreating(false);
  };

  return (
    <div 
      class="w-full h-full flex flex-col overflow-hidden"
      style={{
        "padding": isTablet() ? "2.5vw 3vw" : "16px",
        "padding-bottom": "40px",
        "background-color": "var(--bg-color)"
      }}
    >
      {/* Cabeçalho Principal fiel ao Contacts.jsx */}
      <div 
        class="flex items-center justify-between"
        style={{ "margin-bottom": "1.5rem" }}
      >
        <h1 
          class="font-archivo font-extralight"
          style={{ "font-size": isTablet() ? "3.2rem" : "2.2rem" }}
        >
          Contatos
        </h1>

        <div class="flex items-center gap-3">
          {/* Botão de Busca / Lupa */}
          <button
            onClick={() => setSearchOpen(!searchOpen())}
            class="action-button secondary"
            style={{
              "padding": "10px"
            }}
            title="Pesquisar contatos"
          >
            <MagnifyingGlassIcon size={isTablet() ? 36 : 28} />
          </button>

          {/* Botão de Adicionar Contato */}
          <button
            onClick={() => {
              setIsCreating(true);
              setSelectedContactId(null);
            }}
            class="action-button"
            style={{
              "padding": isTablet() ? "10px 18px" : "10px 14px",
              "font-size": "0.95rem"
            }}
          >
            <PlusIcon size={24} />
            <span>Novo</span>
          </button>
        </div>
      </div>

      {/* Barra de Pesquisa Animada/Expansível */}
      {searchOpen() && (
        <div style={{ "margin-bottom": "1.2rem" }}>
          <input
            type="text"
            placeholder="Pesquisar por nome ou telefone..."
            value={searchQuery()}
            onInput={(e) => setSearchQuery(e.currentTarget.value)}
            class="font-archivo font-light"
            style={{
              "width": "100%",
              "background-color": "var(--surface-color)",
              "border": "1px solid var(--border-color)",
              "border-radius": "16px",
              "padding": "12px 18px",
              "color": "var(--text-color)",
              "font-size": "1.1rem",
              "outline": "none"
            }}
            autofocus
          />
        </div>
      )}

      {/* Corpo com visualização adaptativa de 2 colunas para Tablet (Split View) */}
      <div 
        class="flex-1 flex gap-6 overflow-hidden"
        style={{
          "position": "relative",
          "flex-direction": isTablet() ? "row" : "column"
        }}
      >
        {/* Coluna 1: Lista de Contatos */}
        <div 
          class="flex flex-col overflow-y-auto"
          style={{
            "width": isTablet() ? (isCreating() || selectedContact() ? "50%" : "100%") : "100%",
            "height": "100%",
            "padding-right": "6px"
          }}
        >
          {filteredContacts().length === 0 ? (
            <div 
              class="flex flex-col items-center justify-center text-muted" 
              style={{ "padding": "3rem 1rem", "text-align": "center" }}
            >
              <UserIcon size={56} />
              <p class="font-archivo font-extralight text-lg" style={{ "margin-top": "12px" }}>
                Nenhum contato encontrado.
              </p>
            </div>
          ) : (
            filteredContacts().map((ctt) => (
              <ContactPreview
                contato={ctt}
                isSelected={selectedContactId() === ctt.id && !isCreating()}
                onClick={() => {
                  setSelectedContactId(ctt.id);
                  setIsCreating(false);
                }}
              />
            ))
          )}
        </div>

        {/* Coluna 2: Detalhes do Contato OU Formulário de Criação */}
        {(isTablet() || isCreating() || selectedContact()) && (
          <div 
            class="flex-1 flex flex-col overflow-y-auto"
            style={{
              "height": "100%",
              ...((!isTablet() && (isCreating() || selectedContact())) ? {
                "position": "absolute",
                "top": "0",
                "left": "0",
                "right": "0",
                "bottom": "0",
                "z-index": "10",
                "background-color": "var(--bg-color)",
                "padding": "16px",
                "overflow-y": "auto"
              } : {
                "display": !isTablet() && !isCreating() && !selectedContact() ? "none" : "flex"
              })
            }}
          >
            {/* Modo Criação de Novo Contato */}
            {isCreating() ? (
              <Squircle
                cornerRadius={33}
                class="p-6 flex flex-col justify-between"
                style={{ "min-height": "100%", "background-color": "var(--surface-color)" }}
              >
                <div class="flex flex-col gap-4">
                  <div class="flex items-center justify-between border-b" style={{ "padding-bottom": "12px", "border-color": "var(--border-color)" }}>
                    <h2 class="font-archivo text-3xl font-extralight">
                      Novo Contato
                    </h2>
                    <button 
                      onClick={() => setIsCreating(false)}
                      style={{ "color": "var(--text-color)" }}
                    >
                      <XIcon size={20} />
                    </button>
                  </div>

                  <form onSubmit={handleCreateContact} class="flex flex-col gap-4" style={{ "margin-top": "8px" }}>
                    <div class="flex flex-col gap-1">
                      <label class="text-xs text-muted font-archivo">Nome Completo</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: João da Silva"
                        value={newName()}
                        onInput={(e) => setNewName(e.currentTarget.value)}
                        style={{
                          "background-color": "var(--surface-color)",
                          "border": "1px solid var(--border-color)",
                          "border-radius": "12px",
                          "padding": "12px 14px",
                          "color": "var(--text-color)",
                          "font-size": "1rem",
                          "outline": "none"
                        }}
                      />
                    </div>

                    <div class="flex flex-col gap-1">
                      <label class="text-xs text-muted font-archivo">Telefone</label>
                      <input
                        type="tel"
                        required
                        placeholder="Ex: +55 11 98765-4321"
                        value={newPhone()}
                        onInput={(e) => setNewPhone(e.currentTarget.value)}
                        style={{
                          "background-color": "var(--surface-color)",
                          "border": "1px solid var(--border-color)",
                          "border-radius": "12px",
                          "padding": "12px 14px",
                          "color": "var(--text-color)",
                          "font-size": "1rem",
                          "outline": "none"
                        }}
                      />
                    </div>

                    <div class="flex flex-col gap-1">
                      <label class="text-xs text-muted font-archivo">Endereço</label>
                      <input
                        type="text"
                        placeholder="Ex: Av. Paulista, 1000 - São Paulo"
                        value={newAddress()}
                        onInput={(e) => setNewAddress(e.currentTarget.value)}
                        style={{
                          "background-color": "var(--surface-color)",
                          "border": "1px solid var(--border-color)",
                          "border-radius": "12px",
                          "padding": "12px 14px",
                          "color": "var(--text-color)",
                          "font-size": "1rem",
                          "outline": "none"
                        }}
                      />
                    </div>

                    <div class="flex flex-col gap-1">
                      <label class="text-xs text-muted font-archivo">Observações</label>
                      <textarea
                        rows={3}
                        placeholder="Anotações adicionais sobre o contato..."
                        value={newObs()}
                        onInput={(e) => setNewObs(e.currentTarget.value)}
                        style={{
                          "background-color": "var(--surface-color)",
                          "border": "1px solid var(--border-color)",
                          "border-radius": "12px",
                          "padding": "12px 14px",
                          "color": "var(--text-color)",
                          "font-size": "1rem",
                          "outline": "none",
                          "resize": "none"
                        }}
                      />
                    </div>

                    <div class="flex gap-3" style={{ "margin-top": "12px" }}>
                      <Button variant="primary" onClick={handleCreateContact}>
                        Salvar Contato
                      </Button>
                      <Button variant="ghost" onClick={() => setIsCreating(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </div>
              </Squircle>
            ) : selectedContact() ? (
              /* Modo Exibição de Detalhes do Contato Selecionado */
              <Squircle
                cornerRadius={33}
                class="p-6 flex flex-col justify-between"
                style={{ "min-height": "100%", "background-color": "var(--surface-color)" }}
              >
                <div class="flex flex-col gap-5">
                  <div class="flex items-center justify-between border-b" style={{ "padding-bottom": "14px", "border-color": "var(--border-color)" }}>
                    <div class="flex items-center gap-3">
                      <div 
                        style={{
                          "width": "48px",
                          "height": "48px",
                          "border-radius": "24px",
                          "background-color": "var(--accent-color)",
                          "display": "flex",
                          "align-items": "center",
                          "justify-content": "center",
                          "font-size": "1.4rem",
                          "font-weight": "600",
                          "color": "var(--accent-text)"
                        }}
                      >
                        {selectedContact()?.nome?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <h2 class="font-archivo text-3xl font-extralight">
                          {selectedContact()?.nome}
                        </h2>
                        <span class="text-xs text-dim">Contato #{selectedContact()?.id}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => removeContact(selectedContact()!.id)}
                      class="action-button secondary"
                      style={{
                        "padding": "8px 12px",
                        "font-size": "0.8rem",
                        "min-height": "32px"
                      }}
                      title="Excluir contato"
                    >
                      <TrashIcon size={18} />
                      <span>Excluir</span>
                    </button>
                  </div>

                  <div class="flex flex-col gap-4">
                    {/* Item Telefone */}
                    <div 
                      class="flex items-center gap-4 p-3"
                      style={{ "background-color": "var(--card-color)", "border-radius": "16px" }}
                    >
                      <PhoneIcon size={28} />
                      <div class="flex flex-col">
                        <span class="text-xs text-muted">Telefone</span>
                        <span class="font-archivo text-xl font-light">
                          {formatarTelefone(selectedContact()?.tel || '')}
                        </span>
                      </div>
                    </div>

                    {/* Item Endereço */}
                    <div 
                      class="flex items-center gap-4 p-3"
                      style={{ "background-color": "var(--card-color)", "border-radius": "16px" }}
                    >
                      <MapPinIcon size={28} />
                      <div class="flex flex-col">
                        <span class="text-xs text-muted">Endereço</span>
                        <span class="font-archivo text-base font-light">
                          {selectedContact()?.endereco || 'Não informado'}
                        </span>
                      </div>
                    </div>

                    {/* Item Observações */}
                    {selectedContact()?.obs && (
                      <div 
                        class="flex flex-col gap-1 p-3"
                        style={{ "background-color": "var(--card-color)", "border-radius": "16px" }}
                      >
                        <span class="text-xs text-muted">Anotações</span>
                        <p class="font-archivo text-sm font-light text-dim" style={{ "line-height": "1.5" }}>
                          {selectedContact()?.obs}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div class="flex gap-2" style={{ "margin-top": "20px" }}>
                  <Button variant="secondary" onClick={() => setSelectedContactId(null)}>
                    Fechar Detalhes
                  </Button>
                </div>
              </Squircle>
            ) : (
              <div 
                class="flex flex-col items-center justify-center text-muted" 
                style={{ "min-height": "240px", "text-align": "center" }}
              >
                <UserIcon size={48} />
                <p class="font-archivo font-extralight text-sm" style={{ "margin-top": "8px" }}>
                  Selecione um contato para ver os detalhes
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
