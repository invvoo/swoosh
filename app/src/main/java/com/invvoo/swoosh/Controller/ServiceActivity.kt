package com.invvoo.swoosh.Controller

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Toast
import com.invvoo.swoosh.Model.Servicer
import com.invvoo.swoosh.R
import com.invvoo.swoosh.Utilities.EXTRA_SERVICER
import kotlinx.android.synthetic.main.activity_service.*

class ServiceActivity : BaseActivity() {

    var servicer = Servicer("","","")

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        outState?.putParcelable(EXTRA_SERVICER, servicer)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_service)
    }

    override fun onRestoreInstanceState(savedInstanceState: Bundle) {
        super.onRestoreInstanceState(savedInstanceState)
        if (savedInstanceState != null) {
            servicer = savedInstanceState.getParcelable(EXTRA_SERVICER)!!
        }
    }

    fun onTranslatorClicked(view: View) {
        interpreterButton.isChecked = false
        bothButton.isChecked = false
        servicer.service = "Translator"
    }

    fun onInterpreterClicked(view: View) {
        translatorButton.isChecked = false
        bothButton.isChecked = false
        servicer.service = "Interpreter"
    }

    fun onBothClicked(view: View) {
        translatorButton.isChecked = false
        interpreterButton.isChecked = false
        servicer.service = "Translator & Interpreter"
    }

    fun serviceNextClicked(view: View) {
        if (servicer.service != "") {
            val languagesActivity = Intent(this, LanguagesActivity::class.java)
            languagesActivity.putExtra(EXTRA_SERVICER, servicer)
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