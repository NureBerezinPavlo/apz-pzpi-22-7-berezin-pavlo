package com.example.elevator_monitoring

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "technician_prefs")

class TechnicianAuthRepository(context: Context) {
    private val store = context.dataStore
    private val TOKEN_KEY = stringPreferencesKey("jwt_token")

    val tokenFlow: Flow<String?> = store.data.map { it[TOKEN_KEY] }

    suspend fun saveToken(token: String) {
        store.edit { prefs -> prefs[TOKEN_KEY] = token }
    }

    suspend fun clearToken() {
        store.edit { prefs -> prefs.remove(TOKEN_KEY) }
    }
}