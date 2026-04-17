import * as neonDb from './neonDb.js';

let currentUserId = null;

export function setCurrentUserId(userId) {
  currentUserId = userId;
}

async function getClientIp() {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip || '127.0.0.1';
  } catch {
    return '127.0.0.1';
  }
}

export async function logQuery(fieldName, queryValue, action) {
  try {
    if (!currentUserId) {
      console.warn('No user ID set for query logging');
      return null;
    }

    const ipAddress = await getClientIp();

    return await neonDb.logQuery(
      currentUserId,
      fieldName,
      queryValue || '',
      action,
      ipAddress
    );
  } catch (error) {
    console.error('Error logging query:', error);
  }
}

export async function logFieldSearch(fieldName, value) {
  return logQuery(fieldName, value, 'search');
}

export async function logFieldClick(fieldName) {
  return logQuery(fieldName, '', 'field_click');
}

export async function logFormSubmit(fieldName, value) {
  return logQuery(fieldName, value, 'form_submit');
}
