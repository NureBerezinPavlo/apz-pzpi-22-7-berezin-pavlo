package com.example.elevator_monitoring

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.preferencesDataStore
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.flow.map

// Розширення контексту: створює DataStore<Preferences>
private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "user_prefs")

class AuthRepository(context: Context) {
    // Просто інжектимо dataStore через конструктор, якщо потрібен Context
    private val store = context.dataStore

    companion object {
        // Ключ для збереження токена
        private val TOKEN_KEY = stringPreferencesKey("jwt_token")
    }

    // Потік збереженого токена (nullable)
    val tokenFlow: Flow<String?> = store.data
        .map { prefs ->
            prefs[TOKEN_KEY]
        }

    // Зберегти токен
    suspend fun saveToken(token: String) {
        store.edit { prefs ->
            prefs[TOKEN_KEY] = token
        }
    }

    // Для логауту
    suspend fun clearToken() {
        store.edit { prefs -> prefs.remove(TOKEN_KEY) }
    }

    suspend fun getCleanToken(): String? { // не використовується
        return store.data.map { prefs ->
            prefs[TOKEN_KEY]?.replaceFirst("Bearer ", "")
        }.firstOrNull()
    }
}