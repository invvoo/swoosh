package com.invvoo.swoosh.Controller

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Toast
import com.invvoo.swoosh.R
import com.invvoo.swoosh.Utilities.EXTRA_FROMLANGUAGE
import com.invvoo.swoosh.Utilities.EXTRA_SERVICE
import com.invvoo.swoosh.Utilities.EXTRA_TOLANGUAGE

import kotlinx.android.synthetic.main.activity_languages.*

class LanguagesActivity : BaseActivity() {

       var toLanguage = ""
    var fromLanguage = ""

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_languages)

        val selectedService = intent.getStringExtra(EXTRA_SERVICE)
        iNeedAText.text = "Look for a \n $selectedService \n FROM"

            }

        fun onFromSpanishClick(view: View) {
            fromEnglishBtn.isChecked = false
            toSpanishButton.isChecked = false
            fromLanguage = "English"
        }

        fun onFromEnglishClick(view: View) {
            fromSpanishBtn.isChecked = false
            toEnglishButton.isChecked = false
            fromLanguage = "Spanish"
        }

        fun onToEnglishClick(view: View) {
            toSpanishButton.isChecked = false
            fromEnglishBtn.isChecked = false
            toLanguage = "Spanish"

        }

        fun onToSpanishClick(view: View) {
            toEnglishButton.isChecked = false
            fromSpanishBtn.isChecked = false
            toLanguage = "English"
        }

        fun onLanguageBtnClicked(view: View) {
            if (toLanguage != "") {
                val finishActivity = Intent(this, FinishActivity::class.java)
                val selectedService = intent.getStringExtra(EXTRA_SERVICE)
                finishActivity.putExtra(EXTRA_TOLANGUAGE, toLanguage)
                finishActivity.putExtra(EXTRA_FROMLANGUAGE, fromLanguage)
                finishActivity.putExtra(EXTRA_SERVICE, selectedService)
                startActivity(finishActivity)
            } else {
                Toast.makeText(this, "Please make all selections.", Toast.LENGTH_SHORT).show()
            }


        }


    }




