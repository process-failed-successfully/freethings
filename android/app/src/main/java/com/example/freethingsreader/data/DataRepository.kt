package com.example.freethingsreader.data

import android.content.Context
import android.content.SharedPreferences
import kotlinx.serialization.json.Json
import java.io.IOException

interface DataRepository {
    val books: List<Book>
    val phonicsDictionary: Map<String, PhonicsEntry>
    
    // Parental settings
    var disableReadAloud: Boolean
    var disablePhonicsTips: Boolean
    var lockedLevel: String // "A", "B", "C", "D", "None"

    // Progress tracking
    fun isBookCompleted(bookId: String): Boolean
    fun markBookCompleted(bookId: String, completed: Boolean)
}

class DefaultDataRepository(private val context: Context) : DataRepository {
    
    private val sharedPreferences: SharedPreferences =
        context.getSharedPreferences("reader_settings", Context.MODE_PRIVATE)

    private val json = Json {
        ignoreUnknownKeys = true
    }

    override val books: List<Book> by lazy {
        try {
            context.assets.open("books.json").use { inputStream ->
                val size = inputStream.available()
                val buffer = ByteArray(size)
                inputStream.read(buffer)
                val jsonString = String(buffer, Charsets.UTF_8)
                json.decodeFromString<List<Book>>(jsonString)
            }
        } catch (e: IOException) {
            e.printStackTrace()
            emptyList()
        }
    }

    override val phonicsDictionary: Map<String, PhonicsEntry> by lazy {
        try {
            context.assets.open("phonics.json").use { inputStream ->
                val size = inputStream.available()
                val buffer = ByteArray(size)
                inputStream.read(buffer)
                val jsonString = String(buffer, Charsets.UTF_8)
                json.decodeFromString<Map<String, PhonicsEntry>>(jsonString)
            }
        } catch (e: IOException) {
            e.printStackTrace()
            emptyMap()
        }
    }

    override var disableReadAloud: Boolean
        get() = sharedPreferences.getBoolean("disable_read_aloud", false)
        set(value) {
            sharedPreferences.edit().putBoolean("disable_read_aloud", value).apply()
        }

    override var disablePhonicsTips: Boolean
        get() = sharedPreferences.getBoolean("disable_phonics_tips", false)
        set(value) {
            sharedPreferences.edit().putBoolean("disable_phonics_tips", value).apply()
        }

    override var lockedLevel: String
        get() = sharedPreferences.getString("locked_level", "None") ?: "None"
        set(value) {
            sharedPreferences.edit().putString("locked_level", value).apply()
        }

    override fun isBookCompleted(bookId: String): Boolean {
        return sharedPreferences.getBoolean("completed_book_$bookId", false)
    }

    override fun markBookCompleted(bookId: String, completed: Boolean) {
        sharedPreferences.edit().putBoolean("completed_book_$bookId", completed).apply()
    }
}
