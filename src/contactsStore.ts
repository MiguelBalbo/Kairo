import { createSignal } from 'solid-js';
import { Contact } from './types';

const INITIAL_CONTACTS: Contact[] = [
  {
    id: 1,
    nome: "Fulano",
    tel: "+5511987654321",
    endereco: "Estrada do Imperador, 1000",
    obs: "Contato de trabalho"
  },
  {
    id: 2,
    nome: "Ciclano",
    tel: "+551127654321",
    endereco: "Guarulhos, SP",
    obs: "Amigo da faculdade"
  }
];

function loadStoredContacts(): Contact[] {
  if (typeof window === 'undefined') return INITIAL_CONTACTS;
  try {
    const raw = localStorage.getItem('kairo_contacts');
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Erro ao carregar contatos do localStorage:', e);
  }
  return INITIAL_CONTACTS;
}

export const [contacts, setContacts] = createSignal<Contact[]>(loadStoredContacts());
export const [selectedContactId, setSelectedContactId] = createSignal<number | null>(1);
export const [searchQuery, setSearchQuery] = createSignal<string>('');

export function saveContacts(next: Contact[]) {
  setContacts(next);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('kairo_contacts', JSON.stringify(next));
    } catch (e) {
      console.warn('Erro ao salvar contatos no localStorage:', e);
    }
  }
}

export function addContact(contactData: Omit<Contact, 'id'>): Contact {
  const current = contacts();
  const newContact: Contact = {
    ...contactData,
    id: Date.now()
  };
  const updated = [newContact, ...current];
  saveContacts(updated);
  setSelectedContactId(newContact.id);
  return newContact;
}

export function removeContact(id: number) {
  const updated = contacts().filter((c) => c.id !== id);
  saveContacts(updated);
  if (selectedContactId() === id) {
    setSelectedContactId(updated.length > 0 ? updated[0].id : null);
  }
}

export function formatarTelefone(numeroBruto: string): string {
  if (!numeroBruto) return '';
  const digits = numeroBruto.replace(/\D/g, '');

  // Formato com DDI Brasil (+55)
  if (digits.startsWith('55') && digits.length >= 12) {
    const ddd = digits.slice(2, 4);
    const rest = digits.slice(4);
    if (rest.length === 9) {
      return `+55 (${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
    }
    return `+55 (${ddd}) ${rest.slice(0, 4)}-${rest.slice(4)}`;
  }

  // Formato nacional (DDD + 9 ou 8 dígitos)
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 9) {
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  }
  if (digits.length === 8) {
    return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  }

  return numeroBruto;
}
