package com.invvoo.swoosh.Controller

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import com.invvoo.swoosh.R
import com.invvoo.swoosh.Utilities.EXTRA_FROMLANGUAGE
import com.invvoo.swoosh.Utilities.EXTRA_SERVICE
import com.invvoo.swoosh.Utilities.EXTRA_TOLANGUAGE
import kotlinx.android.synthetic.main.activity_finish.*

class FinishActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_finish)

        val fromLanguage = intent.getStringExtra(EXTRA_TOLANGUAGE)
        val toLanguage = intent.getStringExtra(EXTRA_FROMLANGUAGE)
        val selectedService = intent.getStringExtra(EXTRA_SERVICE)


        searchServicesText.text = "Looking for a $fromLanguage to $toLanguage $selectedService available now..."

    }
}