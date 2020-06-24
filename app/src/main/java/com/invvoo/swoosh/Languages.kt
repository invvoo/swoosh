package com.invvoo.swoosh

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle

class Languages : BaseActivity() {
var language = ""
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_languages)
        language = intent.getStringExtra(EXTRA_LANGUAGE).toString()
        println(language)
    }
}