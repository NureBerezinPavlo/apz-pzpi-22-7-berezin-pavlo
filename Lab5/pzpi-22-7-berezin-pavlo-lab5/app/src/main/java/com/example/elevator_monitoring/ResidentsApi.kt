package com.example.elevator_monitoring

import retrofit2.http.*
import retrofit2.Response

interface ResidentsApi {
    // Реєстрація/авторизація
    @POST("residents/register")
    suspend fun register(@Body creds: RegisterRequest): Response<Unit>

    @POST("residents/login")
    suspend fun login(@Body creds: LoginRequest): Response<LoginResponse>

    @POST("residents/reset-password")
    suspend fun resetPassword(@Body request: ResetPasswordRequest): Response<Unit>

    // Профіль
    @GET("residents/profile")
    suspend fun getProfile(@Header("Authorization") token: String): Response<ProfileResponse>

    @PUT("residents/profile")
    suspend fun updateProfile(
        @Header("Authorization") token: String,
        @Body request: UpdateProfileRequest
    ): Response<ProfileResponse>

    // Ліфти
    @GET("elevators/for-resident")
    suspend fun getElevators(
        @Header("Authorization") token: String
    ): Response<List<ElevatorResponse>>

    // Аварійні функції
    @POST("maintenances/")
    suspend fun requestMaintenance(
        @Header("Authorization") token: String,
        @Body request: MaintenanceRequest
    ): Response<Unit>

    @POST("notifications/emergency")
    suspend fun emergencyCall(
        @Header("Authorization") token: String,
        @Body request: EmergencyRequest
    ): Response<Unit>

    // Історія
    @GET("maintenances/history")
    suspend fun getMaintenanceHistory(
        @Header("Authorization") token: String,
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 10
    ): Response<List<MaintenanceHistoryResponse>>

    // DTO класи
    data class RegisterRequest(
        val name: String,
        val email: String,
        val password: String,
        val building_id: Int
    )

    data class LoginRequest(val email: String, val password: String)
    data class LoginResponse(val access_token: String)

    data class ResetPasswordRequest(val email: String)

    data class ProfileResponse(
        val id: Int,
        val name: String,
        val email: String,
        val building_id: Int
    )

    data class UpdateProfileRequest(
        val name: String? = null,
        val email: String? = null,
        val password: String? = null
    )

    data class ElevatorResponse(
        val id: Int,
        val building_id: Int,
        val serial_number: String,
        val status: String,
        val install_date: String?
    )

    data class MaintenanceRequest(
        val elevator_id: Int,
        val description: String
    )

    data class EmergencyRequest(
        val elevator_id: Int,
        val message: String
    )

    data class MaintenanceHistoryResponse(
        val id: Int,
        val elevator_id: Int,
        val date: String,
        val description: String,
        val status: String
    )
}