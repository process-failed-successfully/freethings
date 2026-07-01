package com.example.freethingsreader.data

import android.content.Context
import android.content.SharedPreferences
import android.content.res.AssetManager
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.eq
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import java.io.ByteArrayInputStream

class DataRepositoryTest {

    private val context = mock<Context>()
    private val assets = mock<AssetManager>()
    private val sharedPrefs = mock<SharedPreferences>()
    private val editor = mock<SharedPreferences.Editor>()

    private val sampleBooksJson = """
        [
          {
            "id": "cat-mat",
            "title": "The Cat on the Mat",
            "level": "A",
            "wordsCount": 17,
            "thumbnail": "images/cat_mat_1.png",
            "pages": [
              { "text": "See the cat.", "image": "images/cat_mat_1.png" }
            ]
          }
        ]
    """.trimIndent()

    private val samplePhonicsJson = """
        {
          "mystery": {
            "parts": ["mys", "ter", "y"],
            "tip": "The 'y' in the middle makes a short /i/ sound!"
          }
        }
    """.trimIndent()

    @Before
    fun setUp() {
        whenever(context.assets).thenReturn(assets)
        whenever(context.getSharedPreferences(eq("reader_settings"), eq(Context.MODE_PRIVATE)))
            .thenReturn(sharedPrefs)
        whenever(sharedPrefs.edit()).thenReturn(editor)
        whenever(editor.putBoolean(any(), any())).thenReturn(editor)
        whenever(editor.putString(any(), any())).thenReturn(editor)
    }

    @Test
    fun testLoadBooksSuccess() {
        val inputStream = ByteArrayInputStream(sampleBooksJson.toByteArray())
        whenever(assets.open("books.json")).thenReturn(inputStream)

        val repository = DefaultDataRepository(context)
        val books = repository.books

        assertEquals(1, books.size)
        val book = books[0]
        assertEquals("cat-mat", book.id)
        assertEquals("The Cat on the Mat", book.title)
        assertEquals("A", book.level)
        assertEquals(17, book.wordsCount)
        assertEquals("images/cat_mat_1.png", book.thumbnail)
        assertEquals(1, book.pages.size)
        assertEquals("See the cat.", book.pages[0].text)
        assertEquals("images/cat_mat_1.png", book.pages[0].image)
    }

    @Test
    fun testLoadPhonicsSuccess() {
        val inputStream = ByteArrayInputStream(samplePhonicsJson.toByteArray())
        whenever(assets.open("phonics.json")).thenReturn(inputStream)

        val repository = DefaultDataRepository(context)
        val phonics = repository.phonicsDictionary

        assertEquals(1, phonics.size)
        val entry = phonics["mystery"]
        assertEquals(listOf("mys", "ter", "y"), entry?.parts)
        assertEquals("The 'y' in the middle makes a short /i/ sound!", entry?.tip)
    }

    @Test
    fun testParentalSettingsGetSet() {
        whenever(sharedPrefs.getBoolean(eq("disable_read_aloud"), eq(false))).thenReturn(true)
        whenever(sharedPrefs.getBoolean(eq("disable_phonics_tips"), eq(false))).thenReturn(false)
        whenever(sharedPrefs.getString(eq("locked_level"), eq("None"))).thenReturn("B")

        val repository = DefaultDataRepository(context)

        assertTrue(repository.disableReadAloud)
        assertFalse(repository.disablePhonicsTips)
        assertEquals("B", repository.lockedLevel)

        repository.disableReadAloud = false
        verify(editor).putBoolean("disable_read_aloud", false)
        verify(editor).apply()
        org.mockito.kotlin.clearInvocations(editor)

        repository.disablePhonicsTips = true
        verify(editor).putBoolean("disable_phonics_tips", true)
        verify(editor).apply()
        org.mockito.kotlin.clearInvocations(editor)

        repository.lockedLevel = "A"
        verify(editor).putString("locked_level", "A")
        verify(editor).apply()
    }

    @Test
    fun testBookCompletionGetSet() {
        whenever(sharedPrefs.getBoolean(eq("completed_book_cat-mat"), eq(false))).thenReturn(true)

        val repository = DefaultDataRepository(context)

        assertTrue(repository.isBookCompleted("cat-mat"))

        repository.markBookCompleted("cat-mat", true)
        verify(editor).putBoolean("completed_book_cat-mat", true)
        verify(editor).apply()
    }
}
