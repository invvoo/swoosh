package com.invvoo.swoosh.Controller

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Toast
import com.invvoo.swoosh.R
import com.invvoo.swoosh.Utilities.EXTRA_SERVICE
import kotlinx.android.synthetic.main.activity_service.*

class ServiceActivity : BaseActivity() {

    var selectedService = ""

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_service)

    }

    fun onTranslatorClicked(view: View) {
        interpreterButton.isChecked = false
        bothButton.isChecked = false
        selectedService = "Translator"
    }

    fun onInterpreterClicked(view: View) {
        translatorButton.isChecked = false
        bothButton.isChecked = false
        selectedService = "Interpreter"
    }

    fun onBothClicked(view: View) {
        translatorButton.isChecked = false
        interpreterButton.isChecked = false
        selectedService = "Translator & Interpreter"
    }

    fun serviceNextClicked(view: View) {
        if (selectedService != "") {
            val languagesActivity = Intent(this, LanguagesActivity::class.java)
            languagesActivity.putExtra(EXTRA_SERVICE, selectedService)
            startActivity(languagesActivity)
        }   else {
            Toast.makeText(this, "Please select a service.", Toast.LENGTH_SHORT).show()
        }

    }


    //vendor application button
//    fun applyVendorClicked(view: View) {
//        val skillActivity = Intent(this, SkillActivity::class.java)
//        startActivity(languageActivity)
//    }


}