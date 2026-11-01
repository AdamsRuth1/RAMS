import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Seed Data ────────────────────────────────────────────────────────────────
const seedSoldiers = [
  { id: 'S001', name: 'PTE Musa Ibrahim', armyNo: 'NA/23/4587', rank: 'Pte', unit: '55 Sig Bde', phone: '08134456709', dob: '2000-06-12', photo: '/soldiers/soldier1.jpg', dateRegistered: '2026-10-28T09:15:00' },
  { id: 'S002', name: 'CPL Okafor Sunday', armyNo: 'NA/21/3678', rank: 'Cpl', unit: '55 Sig Bde', phone: '08022334455', dob: '1998-03-22', photo: '/soldiers/soldier2.jpg', dateRegistered: '2026-10-28T09:20:00' },
  { id: 'S003', name: 'LT Adebayo Tunde', armyNo: 'NA/22/4012', rank: 'Lt', unit: '55 Sig Bde', phone: '08011223344', dob: '1997-11-05', photo: '/soldiers/soldier3.jpg', dateRegistered: '2026-10-28T09:25:00' },
  { id: 'S004', name: 'SSGT Mohammed Ali', armyNo: 'NA/20/3011', rank: 'SSgt', unit: '55 Sig Bde', phone: '08033445566', dob: '1995-07-14', photo: '/soldiers/soldier1.jpg', dateRegistered: '2026-10-28T09:30:00' },
  { id: 'S005', name: 'PTE Ojo Emmanuel', armyNo: 'NA/24/5067', rank: 'Pte', unit: '55 Sig Bde', phone: '08044556677', dob: '2001-02-28', photo: '/soldiers/soldier2.jpg', dateRegistered: '2026-10-28T09:35:00' },
  { id: 'S006', name: 'CPL Lawal Idris', armyNo: 'NA/21/3583', rank: 'Cpl', unit: '55 Sig Bde', phone: '08055667788', dob: '1999-09-17', photo: '/soldiers/soldier3.jpg', dateRegistered: '2026-10-28T09:40:00' },
  { id: 'S007', name: 'PTE Bello Ibrahim', armyNo: 'NA/24/5123', rank: 'Pte', unit: '55 Sig Bde', phone: '08066778899', dob: '2001-04-10', photo: '/soldiers/soldier1.jpg', dateRegistered: '2026-10-29T09:15:00' },
];

const seedRadios = [
  { id: 'R001', serialNo: 'RAD-001', type: 'Motorola GP338', frequency: 'VHF', condition: 'Serviceable', status: 'Available', issuedTo: null, issuedDate: null, returnDate: null, dateAdded: '2026-10-01T08:00:00' },
  { id: 'R002', serialNo: 'RAD-002', type: 'Motorola GP338', frequency: 'VHF', condition: 'Serviceable', status: 'Available', issuedTo: null, issuedDate: null, returnDate: null, dateAdded: '2026-10-01T08:00:00' },
  { id: 'R003', serialNo: 'RAD-003', type: 'Kenwood TK-3401', frequency: 'UHF', condition: 'Serviceable', status: 'Available', issuedTo: null, issuedDate: null, returnDate: null, dateAdded: '2026-10-01T08:00:00' },
  { id: 'R004', serialNo: 'RAD-004', type: 'Kenwood TK-3401', frequency: 'UHF', condition: 'Serviceable', status: 'Available', issuedTo: null, issuedDate: null, returnDate: null, dateAdded: '2026-10-01T08:00:00' },
  { id: 'R005', serialNo: 'RAD-005', type: 'Icom IC-F4003', frequency: 'UHF', condition: 'Faulty', status: 'Under Maintenance', issuedTo: null, issuedDate: null, returnDate: null, dateAdded: '2026-10-01T08:00:00' },
  { id: 'R006', serialNo: 'RAD-006', type: 'Motorola GP338', frequency: 'VHF', condition: 'Serviceable', status: 'Available', issuedTo: null, issuedDate: null, returnDate: null, dateAdded: '2026-10-01T08:00:00' },
  { id: 'R007', serialNo: 'RAD-007', type: 'Hytera PD405', frequency: 'VHF', condition: 'Serviceable', status: 'Available', issuedTo: null, issuedDate: null, returnDate: null, dateAdded: '2026-10-01T08:00:00' },
  { id: 'R008', serialNo: 'RAD-008', type: 'Kenwood TK-3401', frequency: 'UHF', condition: 'Faulty', status: 'Under Maintenance', issuedTo: null, issuedDate: null, returnDate: null, dateAdded: '2026-10-01T08:00:00' },
  { id: 'R014', serialNo: 'RAD-014', type: 'Motorola GP338', frequency: 'VHF', condition: 'Serviceable', status: 'Issued', issuedTo: 'S001', issuedDate: '2026-10-29T14:32:00', returnDate: null, dateAdded: '2026-10-01T08:00:00' },
  { id: 'R021', serialNo: 'RAD-021', type: 'Hytera PD405', frequency: 'VHF', condition: 'Serviceable', status: 'Issued', issuedTo: 'S002', issuedDate: '2026-10-28T10:00:00', returnDate: null, dateAdded: '2026-10-01T08:00:00' },
  { id: 'R023', serialNo: 'RAD-023', type: 'Kenwood TK-3401', frequency: 'UHF', condition: 'Serviceable', status: 'Issued', issuedTo: 'S003', issuedDate: '2026-10-28T16:47:00', returnDate: null, dateAdded: '2026-10-01T08:00:00' },
  { id: 'R033', serialNo: 'RAD-033', type: 'Motorola GP338', frequency: 'VHF', condition: 'Serviceable', status: 'Issued', issuedTo: 'S003', issuedDate: '2026-10-27T09:00:00', returnDate: null, dateAdded: '2026-10-01T08:00:00' },
  { id: 'R041', serialNo: 'RAD-041', type: 'Icom IC-F4003', frequency: 'UHF', condition: 'Serviceable', status: 'Issued', issuedTo: 'S004', issuedDate: '2026-10-28T11:00:00', returnDate: null, dateAdded: '2026-10-01T08:00:00' },
  { id: 'R052', serialNo: 'RAD-052', type: 'Hytera PD405', frequency: 'VHF', condition: 'Serviceable', status: 'Issued', issuedTo: 'S006', issuedDate: '2026-10-27T15:00:00', returnDate: null, dateAdded: '2026-10-01T08:00:00' },
];

const seedTransactions = [
  { id: 'T001', type: 'Issue', radioId: 'R014', radioSerial: 'RAD-014', quantity: 1, soldierId: 'S001', soldierName: 'PTE Musa Ibrahim', soldierArmyNo: 'NA/23/4587', soldierPhoto: '/soldiers/soldier1.jpg', timestamp: '2026-10-29T14:32:00', condition: 'Serviceable', processedBy: '2LT RO Adams', notes: 'Patrol assignment' },
  { id: 'T002', type: 'Return', radioId: 'R007', radioSerial: 'RAD-007', quantity: 1, soldierId: 'S002', soldierName: 'CPL Okafor Sunday', soldierArmyNo: 'NA/21/3678', soldierPhoto: '/soldiers/soldier2.jpg', timestamp: '2026-10-29T11:20:00', condition: 'Serviceable', processedBy: '2LT RO Adams', notes: 'Routine return' },
  { id: 'T003', type: 'Register', radioId: null, radioSerial: null, quantity: 0, soldierId: 'S007', soldierName: 'PTE Bello Ibrahim', soldierArmyNo: 'NA/24/5123', soldierPhoto: '/soldiers/soldier1.jpg', timestamp: '2026-10-29T09:15:00', condition: null, processedBy: '2LT RO Adams', notes: 'New soldier registered' },
  { id: 'T004', type: 'Issue', radioId: 'R023', radioSerial: 'RAD-023', quantity: 1, soldierId: 'S003', soldierName: 'LT Adebayo Tunde', soldierArmyNo: 'NA/22/4012', soldierPhoto: '/soldiers/soldier3.jpg', timestamp: '2026-10-28T16:47:00', condition: 'Serviceable', processedBy: '2LT RO Adams', notes: 'Command frequency check' },
];

// Helper to guarantee valid photos for soldiers and transactions
function ensurePhotos(soldiers, transactions) {
  const defaultPhotos = ['/soldiers/soldier1.jpg', '/soldiers/soldier2.jpg', '/soldiers/soldier3.jpg'];
  const fixedSoldiers = (soldiers && soldiers.length > 0 ? soldiers : seedSoldiers).map((s, idx) => ({
    ...s,
    photo: s.photo || defaultPhotos[idx % defaultPhotos.length],
  }));

  const fixedTransactions = (transactions && transactions.length > 0 ? transactions : seedTransactions).map((t, idx) => {
    const soldier = fixedSoldiers.find((s) => s.id === t.soldierId);
    return {
      ...t,
      quantity: t.quantity !== undefined ? t.quantity : 1,
      soldierPhoto: t.soldierPhoto || t.photo || soldier?.photo || defaultPhotos[idx % defaultPhotos.length],
      photo: t.photo || t.soldierPhoto || soldier?.photo || defaultPhotos[idx % defaultPhotos.length],
    };
  });

  return { fixedSoldiers, fixedTransactions };
}

// ─── Store ─────────────────────────────────────────────────────────────────────
export const useStore = create(
  persist(
    (set, get) => ({
      // Auth
      user: { name: '2LT RO Adams', role: 'Admin', armyNo: '2LT/RO/001' },
      isAuthenticated: false,
      login: (username, password) => {
        if (username && password) {
          set({ isAuthenticated: true });
          return true;
        }
        return false;
      },
      logout: () => set({ isAuthenticated: false }),

      // Soldiers
      soldiers: seedSoldiers,
      addSoldier: (soldier) => {
        const id = 'S' + String(get().soldiers.length + 1).padStart(3, '0');
        const photo = soldier.photo || '/soldiers/soldier1.jpg';
        const newSoldier = { ...soldier, id, photo, dateRegistered: new Date().toISOString() };
        const newTx = {
          id: 'T' + Date.now(),
          type: 'Register',
          radioId: null,
          radioSerial: null,
          quantity: 0,
          soldierId: id,
          soldierName: soldier.name,
          soldierArmyNo: soldier.armyNo,
          soldierPhoto: photo,
          photo: photo,
          timestamp: new Date().toISOString(),
          condition: null,
          processedBy: get().user.name,
          notes: 'New soldier registered',
        };
        set((s) => ({
          soldiers: [...s.soldiers, newSoldier],
          transactions: [newTx, ...s.transactions],
        }));
        return newSoldier;
      },
      updateSoldier: (id, updates) =>
        set((s) => ({
          soldiers: s.soldiers.map((sol) => (sol.id === id ? { ...sol, ...updates } : sol)),
        })),
      deleteSoldier: (id) =>
        set((s) => ({ soldiers: s.soldiers.filter((sol) => sol.id !== id) })),

      // Radios
      radios: seedRadios,
      addRadio: (radio) => {
        const count = get().radios.length + 1;
        const id = 'R' + String(count).padStart(3, '0');
        const serialNo = 'RAD-' + String(count).padStart(3, '0');
        const newRadio = {
          ...radio,
          id,
          serialNo: radio.serialNo || serialNo,
          status: 'Available',
          issuedTo: null,
          issuedDate: null,
          returnDate: null,
          dateAdded: new Date().toISOString(),
        };
        set((s) => ({ radios: [...s.radios, newRadio] }));
        return newRadio;
      },
      updateRadio: (id, updates) =>
        set((s) => ({
          radios: s.radios.map((r) => (r.id === id ? { ...r, ...updates } : r)),
        })),
      deleteRadio: (id) =>
        set((s) => ({ radios: s.radios.filter((r) => r.id !== id) })),

      // ─── UNIFIED: Register Soldier & Immediately Issue Radio ─────────────────
      registerAndIssueRadio: ({
        soldierId,
        name,
        armyNo,
        rank = 'Pte',
        unit = '55 Sig Bde',
        phone = '',
        dob = '',
        photo = null,
        radioSerials = '',
        quantity = 1,
        radioType = 'Motorola GP338',
        condition = 'Serviceable',
        notes = '',
      }) => {
        const now = new Date().toISOString();
        let allSoldiers = [...get().soldiers];
        let soldierObj = null;

        // 1. Resolve or Create Soldier
        if (soldierId) {
          soldierObj = allSoldiers.find((s) => s.id === soldierId);
          if (soldierObj && photo) {
            soldierObj = { ...soldierObj, photo };
            allSoldiers = allSoldiers.map((s) => (s.id === soldierId ? soldierObj : s));
          }
        }

        if (!soldierObj) {
          const newId = 'S' + String(allSoldiers.length + 1).padStart(3, '0');
          soldierObj = {
            id: newId,
            name: name.trim(),
            armyNo: armyNo.trim(),
            rank,
            unit,
            phone,
            dob,
            photo: photo || '/soldiers/soldier1.jpg',
            dateRegistered: now,
          };
          allSoldiers = [soldierObj, ...allSoldiers];
        }

        // 2. Parse Serial Numbers
        let serialsList = [];
        if (Array.isArray(radioSerials)) {
          serialsList = radioSerials.map((s) => String(s).trim()).filter(Boolean);
        } else if (typeof radioSerials === 'string') {
          serialsList = radioSerials.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
        }

        const qty = Math.max(1, Number(quantity) || (serialsList.length > 0 ? serialsList.length : 1));

        // If fewer serials provided than quantity, fill up with placeholders or single entry
        if (serialsList.length === 0) {
          const nextCount = get().radios.length + 1;
          serialsList = [`RAD-${String(nextCount).padStart(3, '0')}`];
        }

        // 3. Update or Add Radios in Inventory
        let updatedRadios = [...get().radios];
        serialsList.forEach((serialStr) => {
          const existingIdx = updatedRadios.findIndex(
            (r) => r.serialNo.toLowerCase() === serialStr.toLowerCase()
          );
          if (existingIdx >= 0) {
            updatedRadios[existingIdx] = {
              ...updatedRadios[existingIdx],
              status: 'Issued',
              issuedTo: soldierObj.id,
              issuedDate: now,
              returnDate: null,
              condition: condition || updatedRadios[existingIdx].condition || 'Serviceable',
            };
          } else {
            const newRadioId = 'R' + String(updatedRadios.length + 1).padStart(3, '0');
            updatedRadios.push({
              id: newRadioId,
              serialNo: serialStr,
              type: radioType || 'Motorola GP338',
              frequency: 'VHF',
              condition: condition || 'Serviceable',
              status: 'Issued',
              issuedTo: soldierObj.id,
              issuedDate: now,
              returnDate: null,
              dateAdded: now,
            });
          }
        });

        const soldierActualPhoto = photo || soldierObj.photo || '/soldiers/soldier1.jpg';

        // 4. Create Transaction Record with Actual Soldier Photo Saved
        const newTx = {
          id: 'T' + Date.now(),
          type: 'Issue',
          radioSerial: serialsList.join(', '),
          quantity: qty,
          soldierId: soldierObj.id,
          soldierName: soldierObj.name,
          soldierArmyNo: soldierObj.armyNo,
          soldierRank: soldierObj.rank,
          soldierPhoto: soldierActualPhoto,
          photo: soldierActualPhoto,
          timestamp: now,
          condition: condition || 'Serviceable',
          processedBy: get().user.name,
          notes: notes || `Issued ${qty} radio(s)`,
        };

        set({
          soldiers: allSoldiers,
          radios: updatedRadios,
          transactions: [newTx, ...get().transactions],
        });

        return {
          success: true,
          soldier: soldierObj,
          serials: serialsList,
          quantity: qty,
          transaction: newTx,
        };
      },

      // Issue Radio (standard / legacy support)
      issueRadio: ({ radioId, radioSerial, soldierId, condition, notes, photo, quantity = 1 }) => {
        let radio = radioId ? get().radios.find((r) => r.id === radioId) : null;
        if (!radio && radioSerial) {
          radio = get().radios.find((r) => r.serialNo.toLowerCase() === radioSerial.toLowerCase());
        }
        const soldier = get().soldiers.find((s) => s.id === soldierId);
        if (!soldier) return false;

        const now = new Date().toISOString();
        const serialNo = radio ? radio.serialNo : (radioSerial || 'RAD-CUSTOM');
        const resolvedPhoto = photo || soldier.photo || '/soldiers/soldier1.jpg';

        let updatedRadios = [...get().radios];
        if (radio) {
          updatedRadios = updatedRadios.map((r) =>
            r.id === radio.id
              ? { ...r, status: 'Issued', issuedTo: soldierId, issuedDate: now, returnDate: null }
              : r
          );
        } else {
          updatedRadios.push({
            id: 'R' + Date.now(),
            serialNo,
            type: 'Motorola GP338',
            frequency: 'VHF',
            condition: condition || 'Serviceable',
            status: 'Issued',
            issuedTo: soldierId,
            issuedDate: now,
            returnDate: null,
            dateAdded: now,
          });
        }

        const tx = {
          id: 'T' + Date.now(),
          type: 'Issue',
          radioId: radio ? radio.id : null,
          radioSerial: serialNo,
          quantity: Number(quantity) || 1,
          soldierId,
          soldierName: soldier.name,
          soldierArmyNo: soldier.armyNo,
          soldierRank: soldier.rank,
          soldierPhoto: resolvedPhoto,
          photo: resolvedPhoto,
          timestamp: now,
          condition: condition || 'Serviceable',
          processedBy: get().user.name,
          notes: notes || '',
        };

        set({
          radios: updatedRadios,
          transactions: [tx, ...get().transactions],
        });
        return true;
      },

      // Return Radio (without signature)
      returnRadio: ({ radioId, condition, notes, photo }) => {
        const radio = get().radios.find((r) => r.id === radioId);
        if (!radio) return false;
        const soldier = get().soldiers.find((s) => s.id === radio.issuedTo);
        const now = new Date().toISOString();
        const newStatus = condition === 'Faulty' ? 'Under Maintenance' : 'Available';
        const resolvedPhoto = photo || soldier?.photo || '/soldiers/soldier1.jpg';

        const tx = {
          id: 'T' + Date.now(),
          type: 'Return',
          radioId,
          radioSerial: radio.serialNo,
          quantity: 1,
          soldierId: radio.issuedTo,
          soldierName: soldier?.name || 'Unknown',
          soldierArmyNo: soldier?.armyNo || '',
          soldierRank: soldier?.rank || '',
          soldierPhoto: resolvedPhoto,
          photo: resolvedPhoto,
          timestamp: now,
          condition: condition || 'Serviceable',
          processedBy: get().user.name,
          notes: notes || '',
        };

        set((s) => ({
          radios: s.radios.map((r) =>
            r.id === radioId ? { ...r, status: newStatus, issuedTo: null, issuedDate: null, returnDate: now } : r
          ),
          transactions: [tx, ...s.transactions],
        }));
        return true;
      },

      // Transactions
      transactions: seedTransactions,
    }),
    {
      name: 'rams-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          const { fixedSoldiers, fixedTransactions } = ensurePhotos(state.soldiers, state.transactions);
          state.soldiers = fixedSoldiers;
          state.transactions = fixedTransactions;
        }
      },
      partialize: (state) => ({
        soldiers: state.soldiers,
        radios: state.radios,
        transactions: state.transactions,
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
    }
  )
);
