package com.example.elevator_monitoring

import com.google.gson.annotations.SerializedName
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Path
import retrofit2.http.Query

interface TechniciansApi {
    // Авторизація
    @POST("technicians/login")
    suspend fun login(@Body creds: LoginRequest): Response<LoginResponse>

    // Профіль
    @GET("technicians/profile")
    suspend fun getProfile(@Header("Authorization") token: String): Response<ProfileResponse>

    @PUT("technicians/profile")
    suspend fun updateProfile(
        @Header("Authorization") token: String,
        @Body request: UpdateProfileRequest
    ): Response<ProfileResponse>

    // Завдання
    @GET("maintenances/pending-maintenance")
    suspend fun getPendingTasks(
        @Header("Authorization") token: String
    ): Response<List<TaskResponse>>

    @PUT("maintenances/{record_id}")
    suspend fun assignTask(
        @Header("Authorization") token: String,
        @Path("record_id") recordId: Int,
        @Body request: AssignTaskRequest
    ): Response<Unit>

    // Додаємо DTO для запиту на призначення завдання
    data class AssignTaskRequest(
        @SerializedName("technician_id") val technicianId: Int
    )

    // Ліфти
    @GET("elevators/{elevator_id}")
    suspend fun getElevatorDetails(
        @Header("Authorization") token: String,
        @Path("elevator_id") elevatorId: Int
    ): Response<ElevatorDetailsResponse>

    @PUT("elevators/{elevator_id}/status")
    suspend fun updateElevatorStatus(
        @Header("Authorization") token: String,
        @Path("elevator_id") elevatorId: Int,
        @Body request: UpdateStatusRequest
    ): Response<Unit>

    @POST("maintenances/comment")
    suspend fun addRepairComment(
        @Header("Authorization") token: String,
        @Body request: AddCommentRequest
    ): Response<Unit>

    // Телеметрія
    @GET("sensors/latest/{elevator_id}")
    suspend fun getLatestTelemetry(
        @Header("Authorization") token: String,
        @Path("elevator_id") elevatorId: Int
    ): Response<TelemetryResponse>

    @GET("maintenances/history-tech")
    suspend fun getHistory(
        @Header("Authorization") token: String
    ): Response<List<HistoryResponse>>


    // DTO класи
    data class LoginRequest(val email: String, val password: String)
    data class LoginResponse(val access_token: String)

    data class ProfileResponse(
        val id: Int,
        val name: String,
        val phone_number: String,
        val email: String
    )

    data class UpdateProfileRequest(
        val name: String? = null,
        val phone_number: String? = null,
        val email: String? = null,
        val password: String? = null
    )

    data class TaskResponse(
        val id: Int,
        val elevator_id: Int,
        val building_name: String,
        val address: String,
        val description: String,
        val created_at: String,
        val priority: String
    )

    data class ElevatorDetailsResponse(
        val id: Int,
        val serial_number: String,
        val status: String,
        val install_date: String,
        val repair_history: List<RepairHistoryItem>? = null
    )


    data class RepairHistoryItem(
        val id: Int,
        val date: String,
        val technician_name: String,
        val description: String
    )

    data class UpdateStatusRequest(val status: String)
    data class AddCommentRequest(val task_id: Int, val comment: String)

    data class TelemetryResponse(
        val temperature: Float,
        val humidity: Float,
        val weight: Float,
        val is_power_on: Boolean,
        val is_moving: Boolean,
        val is_stuck: Boolean,
        val timestamp: String
    )
    data class PendingResponse(
        val pending_maintenances: List<TechniciansApi.TaskResponse>
    )

    data class HistoryResponse(
        val id: Int,
        val elevator_id: Int,
        val description: String,
        val maintenance_date: String
    )

    // метод для отримання проблемних ліфтів
    @GET("elevators/problem-status")
    suspend fun getProblemElevators(
        @Header("Authorization") token: String
    ): Response<List<ElevatorStatusResponse>>

    // модель даних для статусу ліфта
    data class ElevatorStatusResponse(
        val id: Int,
        val building_name: String,
        val address: String,
        val status: String, // "normal", "warning", "critical"
        val last_update: String,
        val assigned_technician: String
    )
}