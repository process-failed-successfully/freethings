package com.example.freethingsreader.data

import kotlinx.serialization.Serializable

@Serializable
data class BookPage(
    val text: String,
    val image: String
)

@Serializable
data class Book(
    val id: String,
    val title: String,
    val level: String,
    val wordsCount: Int,
    val thumbnail: String,
    val pages: List<BookPage>
)

@Serializable
data class PhonicsEntry(
    val parts: List<String>,
    val tip: String
)
