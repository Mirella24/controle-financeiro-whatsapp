import { findOrCreatePerson } from '../services/people.service.js';
const { createEntry } = require('../services/entries.service');

export async function createTestEntry(req, res) {
  try {
    const { name, description, amount, entryDate } = req.body;

    if (!name || !description || amount === undefined || !entryDate) {
      return res.status(400).json({
        ok: false,
        message: 'Campos obrigatórios: name, description, amount, entryDate'
      });
    }

    const numericAmount = Number(amount);

    if (Number.isNaN(numericAmount) || numericAmount < 0) {
      return res.status(400).json({
        ok: false,
        message: 'O campo amount deve ser um número válido'
      });
    }

    const person = await findOrCreatePerson(name);

    const entry = await createEntry({
      personId: person.id,
      description,
      amount: numericAmount,
      entryDate
    });

    return res.status(201).json({
      ok: true,
      message: 'Lançamento criado com sucesso',
      person,
      entry
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error.message
    });
  }
}

export async function getEntriesByPerson(req, res) {
  try {
    const { name } = req.params;

    const person = await findOrCreatePerson(name);
    const entries = await listEntriesByPerson(person.id);

    const total = entries.reduce((sum, item) => {
      return sum + Number(item.amount);
    }, 0);

    return res.status(200).json({
      ok: true,
      person,
      total,
      totalEntries: entries.length,
      entries
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error.message
    });
  }
}