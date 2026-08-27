import { SupportedLanguage } from "./speechService";

export interface ConversationTurn {
  id: string;
  sender: "patient" | "assistant";
  text: string;
  timestamp: string;
  isEmergency?: boolean;
}

export const conversationService = {
  detectEmergency(query: string): boolean {
    const q = query.toLowerCase();
    const emergencyKeywords = [
      "severe chest pain",
      "crushing chest",
      "cannot breathe",
      "can't breathe",
      "difficulty breathing",
      "coughing blood",
      "collapsed",
      "unconscious",
      "heart attack",
      "छातीत तीव्र वेदना",
      "श्वास घेता येत नाही",
      "सीने में तेज दर्द",
      "सांस नहीं आ रही",
      "நெஞ்சு வலி",
      "மூச்சு திணறல்",
    ];

    return emergencyKeywords.some((k) => q.includes(k));
  },

  async processQuery(
    query: string,
    language: SupportedLanguage
  ): Promise<{ response: string; isEmergency: boolean; isEscalation: boolean }> {
    const q = query.toLowerCase().trim();

    // 1. Emergency Detection
    if (this.detectEmergency(q)) {
      const emergencyResponse =
        language === "mr"
          ? "आपल्या लक्षणांमुळे तात्काळ वैद्यकीय मदतीची गरज भासू शकते. कृपया त्वरित 108 रुग्णवाहिकेला कॉल करा किंवा जवळच्या आपत्कालीन विभागात जा."
          : language === "hi"
          ? "आपके लक्षणों के लिए तत्काल आपातकालीन चिकित्सा सहायता की आवश्यकता हो सकती है। कृपया तुरंत 108 एम्बुलेंस पर कॉल करें।"
          : language === "ta"
          ? "உங்கள் அறிகுறிகளுக்கு அவசர மருத்துவ சிகிச்சை தேவைப்படலாம். தயவுசெய்து உடனடியாக 108 ஆம்புலன்ஸை அழைக்கவும்."
          : "Urgent medical attention may be required for your symptoms. Please immediately call 108 for an ambulance or proceed to the nearest emergency department.";

      return {
        response: emergencyResponse,
        isEmergency: true,
        isEscalation: false,
      };
    }

    // 2. Clinician Escalation Request
    if (
      q.includes("doctor") ||
      q.includes("human") ||
      q.includes("real doctor") ||
      q.includes("speak to clinician") ||
      q.includes("talk to dr") ||
      q.includes("ananya") ||
      q.includes("डॉक्टर") ||
      q.includes("மருத்துவர்")
    ) {
      const escalationResponse =
        language === "mr"
          ? "नक्कीच. मी आपल्याला पर्यवेक्षक डॉक्टर डॉ. अनन्या राव यांच्याशी थेट जोडण्याची विनंती पाठवत आहे."
          : language === "hi"
          ? "बिल्कुल। मैं आपको सीधे पर्यवेक्षक चिकित्सक डॉ. अनन्या राव से जोड़ने का अनुरोध भेज रहा हूँ।"
          : language === "ta"
          ? "நிச்சயமாக. மேற்பார்வை மருத்துவர் டாக்டர் அனன்யா ராவ் அவர்களுடன் நேரடியாக இணைக்கிறேன்."
          : "Of course. I can connect you with the supervising healthcare team. Connecting you to Dr. Ananya Rao now.";

      return {
        response: escalationResponse,
        isEmergency: false,
        isEscalation: true,
      };
    }

    // 3. Procedure Explanation
    if (
      q.includes("procedure") ||
      q.includes("during") ||
      q.includes("what happens") ||
      q.includes("angiogram") ||
      q.includes("how is it done") ||
      q.includes("प्रक्रिया") ||
      q.includes("செயல்முறை")
    ) {
      const resp =
        language === "mr"
          ? "कोरोनरी अँजिओग्राम दरम्यान, स्थानिक भूल देऊन मनगटातील धमनीद्वारे एक पातळ कॅथेटर नळी सोडली जाते. क्ष-किरण द्वारे हृदयाच्या रक्तवाहिन्यांची तपासणी केली जाते. ही तपासणी 30 ते 45 मिनिटे चालते."
          : language === "hi"
          ? "कोरोनरी एंजियोग्राम के दौरान, कलाई की धमनी के माध्यम से एक पतली कैथेटर ट्यूब डाली जाती है। एक्स-रे डाई से हृदय की धमनियों में रुकावट की जांच की जाती है। इसमें लगभग 30 से 45 मिनट लगते हैं।"
          : language === "ta"
          ? "கொரோனரி ஆஞ்சியோகிராம் போது, மணிக்கட்டு தமனி வழியாக மெல்லிய குழாய் செலுத்தப்பட்டு எக்ஸ்ரே மூலம் இதய ரத்த நாளங்கள் பரிசோதிக்கப்படுகின்றன. இதற்கு 30 முதல் 45 நிமிடங்கள் ஆகும்."
          : "During a coronary angiogram, a thin catheter tube is gently inserted through a small artery in your wrist under local anesthesia. Contrast dye is used with fluoroscopy X-rays to visualize your coronary arteries. The procedure takes approximately 30 to 45 minutes.";

      return { response: resp, isEmergency: false, isEscalation: false };
    }

    // 4. Hospital Stay & Recovery
    if (
      q.includes("hospital") ||
      q.includes("stay") ||
      q.includes("admit") ||
      q.includes("discharge") ||
      q.includes("दवाखाना") ||
      q.includes("மருத்துவமனை")
    ) {
      const resp =
        language === "mr"
          ? "बहुतेक रुग्णांना डे-केअर निरीक्षण वॉर्डमध्ये 4 ते 6 तास ठेवले जाते. डॉक्टरांनी अहवाल तपासल्यानंतर आपण त्याच दिवशी घरी जाऊ शकता."
          : language === "hi"
          ? "अधिकांश मरीज डेकेयर ऑब्जर्वेशन वार्ड में 4 से 6 घंटे रहते हैं। डॉक्टर द्वारा रिपोर्ट की समीक्षा के बाद आप उसी दिन घर जा सकते हैं।"
          : language === "ta"
          ? "பெரும்பாலான நோயாளிகள் 4 முதல் 6 மணி நேரம் கண்காணிப்பில் இருப்பார்கள். மருத்துவர் பரிசோதித்த பிறகு அன்றைய தினமே வீடு திரும்பலாம்."
          : "Most patients recover in the daycare observation ward for 4 to 6 hours. After Dr. Rao reviews your imaging results, you can usually go home the same afternoon with your family.";

      return { response: resp, isEmergency: false, isEscalation: false };
    }

    // 5. Risks & Pain
    if (
      q.includes("risk") ||
      q.includes("pain") ||
      q.includes("hurt") ||
      q.includes("side effect") ||
      q.includes("त्रास") ||
      q.includes("வலி")
    ) {
      const resp =
        language === "mr"
          ? "स्थानिक भूल दिल्यामुळे तीव्र वेदना होत नाहीत. मनगटावर हलकी सूज येणे हा सामान्य धोका आहे. गंभीर दुष्परिणाम अत्यंत दुर्मिळ आहेत."
          : language === "hi"
          ? "लोकल एनेस्थीसिया के कारण तेज दर्द नहीं होता। कलाई पर हल्का सा नीला पड़ना सामान्य है, गंभीर जोखिम बहुत दुर्लभ हैं।"
          : language === "ta"
          ? "உள்ளூர் மயக்க மருந்து கொடுக்கப்படுவதால் வலி இருக்காது. லேசான காயம் ஏற்படலாம், ஆனால் தீவிர பக்கவிளைவுகள் மிகவும் குறைவு."
          : "Local numbing medication is applied at the wrist site so you will not feel sharp pain. Common risks are minor, such as mild bruising at the entry site (3-5%). Serious allergic reactions are rare (<0.5%).";

      return { response: resp, isEmergency: false, isEscalation: false };
    }

    // 6. General / Default Answer
    const defaultResp =
      language === "mr"
        ? "मी आपल्या नियोजित अँजिओग्राम प्रक्रियेची माहिती आणि संमती समजावून सांगण्यासाठी येथे आहे. आपण प्रक्रिया, जोखीम किंवा पर्यायांबद्दल विचारू शकता."
        : language === "hi"
        ? "मैं आपकी नियोजित एंजियोग्राम प्रक्रिया और सहमति को समझाने के लिए यहाँ हूँ। आप प्रक्रिया, जोखिम या विकल्पों के बारे में पूछ सकते हैं।"
        : language === "ta"
        ? "உங்கள் ஆஞ்சியோகிராம் செயல்முறை மற்றும் ஒப்புதல் படிவத்தை விளக்க நான் இங்கே இருக்கிறேன். நீங்கள் தாராளமாக கேள்விகள் கேட்கலாம்."
        : "Based on the approved clinical information provided by your cardiology team at Nandurbar District Civil Hospital, I can explain any details about your planned procedure, what to expect, and guide your informed consent.";

    return { response: defaultResp, isEmergency: false, isEscalation: false };
  },
};
