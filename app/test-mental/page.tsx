"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Flower, ArrowLeft, ArrowRight } from "lucide-react";

import { useApp } from "@/providers/AppContext";
import { Button } from "@/components/Button";
import { sendMessageToGeminiServer } from "@/services/geminiService";

type TestState = "intro" | "testing" | "result";
type AppLanguage = "vi" | "en";

const QUESTIONS: Record<AppLanguage, string[]> = {
    vi: [
        "Tôi thấy mình hay bối rối trước những việc chẳng đâu vào đâu",
        "Tôi bị khô miệng",
        "Tôi dường như chẳng có chút cảm xúc tích cực nào",
        "Tôi dường như không thể làm việc như trước được",
        "Tôi có xu hướng phản ứng thái quá với mọi tình huống",
        "Tôi có cảm giác bị run (tay, chân…)",
        "Tôi thấy khó thư giãn được",
        "Tôi rơi vào sự việc khiến tôi rất lo lắng và hoảng sợ (tôi chỉ dịu lại khi sự việc đó đã qua đi)",
        "Tôi thấy mình vô dụng và chẳng có gì để mong đợi cả",
        "Tôi thấy mình đang suy nghĩ quá nhiều",
        "Tôi cảm thấy buồn chán, trì trệ",
        "Tôi thấy bản thân không thể kiên nhẫn được khi phải chờ đợi",
        "Tôi thấy mình mệt mỏi và muốn ngất xỉu",
        "Tôi mất hứng thú với mọi việc",
        "Tôi khá dễ phật ý, tự ái",
        "Tôi bị đổ mồ hôi dù chẳng vì làm việc nặng hay do trời nóng",
        "Tôi hay lo sợ vô cớ",
        "Tôi thấy bản thân khó chịu và không được thoải mái",
        "Tôi chẳng thấy thích thú gì với những việc mình đã làm",
        "Tôi cảm thấy tim đập nhanh (hoặc đập loạn nhịp) dù không hoạt động gắng sức",
        "Tôi cảm thấy chán nản và thất vọng",
        "Tôi dễ cáu kỉnh và bực bội",
        "Tôi thấy bản thân gần như hoảng loạn",
        "Sau khi bị bối rối tôi thấy khó mà trấn tĩnh lại được",
        "Tôi sợ phải làm những việc tuy bình thường nhưng trước đây tôi chưa làm bao giờ",
        "Tôi không thấy hào hứng với bất kỳ việc gì nữa",
        "Tôi thấy khó chấp nhận việc đang làm nhưng bị gián đoạn",
        "Tôi sống trong tình trạng lo lắng và căng thẳng",
        "Tôi không chấp nhận được việc có cái gì đó xen vào cản trở việc tôi đang làm",
        "Tôi chẳng thấy có hy vọng gì ở tương lai cả",
    ],
    en: [
        "I often feel confused by small or trivial things",
        "I experience dry mouth",
        "I seem unable to feel any positive emotions",
        "I feel that I can no longer work as well as before",
        "I tend to overreact to situations",
        "I experience trembling (for example in my hands or legs)",
        "I find it hard to relax",
        "I go through situations that make me very anxious or panicked",
        "I feel worthless and have nothing to look forward to",
        "I feel that I am overthinking too much",
        "I feel dull, low, or emotionally drained",
        "I find it hard to be patient when I have to wait",
        "I feel tired and close to fainting",
        "I have lost interest in many things",
        "I am easily offended or hurt",
        "I sweat even when I am not physically active or when the weather is not hot",
        "I often feel afraid for no clear reason",
        "I feel uncomfortable and uneasy",
        "I no longer enjoy things I used to do",
        "I feel my heart racing even without physical effort",
        "I feel discouraged and disappointed",
        "I become irritable and frustrated easily",
        "I feel close to panic",
        "After becoming upset, I find it difficult to calm myself down",
        "I am afraid of doing ordinary things that I have never done before",
        "I do not feel excited about anything anymore",
        "I find it hard to accept interruptions while doing something",
        "I live in a state of worry and tension",
        "I cannot tolerate something interfering with what I am doing",
        "I feel hopeless about the future",
    ],
};

const OPTIONS: Record<AppLanguage, { value: number; label: string }[]> = {
    vi: [
        { value: 0, label: "Không đúng với tôi chút nào cả" },
        { value: 1, label: "Đúng với tôi một phần, hoặc thỉnh thoảng mới đúng" },
        { value: 2, label: "Đúng với tôi phần nhiều, hoặc phần lớn thời gian là đúng" },
        { value: 3, label: "Hoàn toàn đúng với tôi, hoặc hầu hết thời gian là đúng" },
    ],
    en: [
        { value: 0, label: "Did not apply to me at all" },
        { value: 1, label: "Applied to me to some degree, or some of the time" },
        { value: 2, label: "Applied to me to a considerable degree, or a good part of time" },
        { value: 3, label: "Applied to me very much, or most of the time" },
    ],
};

const UI_TEXT: Record<
    AppLanguage,
    {
        title: string;
        intro: string;
        start: string;
        question: string;
        back: string;
        next: string;
        viewResult: string;
        yourScore: string;
        scoreSuffix: string;
        adviceForYou: string;
        suggestionFromBrand: string;
        loadingAdvice: string;
        goHome: string;
        retake: string;
    }
> = {
    vi: {
        title: "Khảo sát Sức khỏe Tinh thần",
        intro:
            "Bài kiểm tra này gồm 30 câu hỏi giúp đánh giá mức độ căng thẳng, lo âu và trầm cảm của bạn trong thời gian gần đây. Hãy chọn câu trả lời phản ánh đúng nhất tình trạng của bạn. Kết quả sẽ giúp An Tịnh Việt đưa ra những gợi ý phù hợp hơn cho hành trình chăm sóc tinh thần của bạn.",
        start: "Bắt đầu bài test",
        question: "Câu hỏi",
        back: "Quay lại",
        next: "Tiếp theo",
        viewResult: "Xem kết quả",
        yourScore: "Tổng điểm của bạn",
        scoreSuffix: "/90",
        adviceForYou: "Lời khuyên cho bạn",
        suggestionFromBrand: "Gợi ý từ An Tịnh Việt",
        loadingAdvice: "Đang phân tích kết quả và tìm gợi ý phù hợp...",
        goHome: "Về trang chủ",
        retake: "Làm lại bài test",
    },
    en: {
        title: "Mental Health Assessment",
        intro:
            "This assessment includes 30 questions to help evaluate your recent levels of stress, anxiety, and depression. Please choose the answer that best reflects your current experience. The result will help An Tinh Viet suggest a more suitable healing journey for you.",
        start: "Start the assessment",
        question: "Question",
        back: "Back",
        next: "Next",
        viewResult: "View result",
        yourScore: "Your total score",
        scoreSuffix: "/90",
        adviceForYou: "Advice for you",
        suggestionFromBrand: "Suggestions from An Tinh Viet",
        loadingAdvice: "Analyzing your result and finding suitable suggestions...",
        goHome: "Back to home",
        retake: "Retake assessment",
    },
};

function getResultClassification(totalScore: number, language: AppLanguage) {
    if (language === "vi") {
        if (totalScore <= 22) {
            return {
                level: "Không có hoặc rất ít dấu hiệu trầm cảm",
                color: "text-green-600",
                bgColor: "bg-green-50",
                borderColor: "border-green-200",
                description:
                    "Bạn đang ở trạng thái sức khỏe tinh thần tương đối ổn định. Những căng thẳng nhỏ trong cuộc sống vẫn có thể xuất hiện, nhưng nhìn chung bạn vẫn duy trì được sự cân bằng.",
                advice:
                    "Duy trì thói quen ngủ đủ và sinh hoạt điều độ. Dành thời gian cho những hoạt động mang lại niềm vui. Thường xuyên vận động cơ thể hoặc tiếp xúc với thiên nhiên. Giữ kết nối với bạn bè, gia đình hoặc cộng đồng.",
            };
        }

        if (totalScore <= 45) {
            return {
                level: "Trầm cảm nhẹ",
                color: "text-yellow-600",
                bgColor: "bg-yellow-50",
                borderColor: "border-yellow-200",
                description:
                    "Bạn đang có một số dấu hiệu căng thẳng, buồn chán hoặc mệt mỏi tinh thần. Điều này khá phổ biến khi cuộc sống có nhiều áp lực. Đây là thời điểm phù hợp để nghỉ ngơi, điều chỉnh nhịp sống và chăm sóc bản thân nhiều hơn.",
                advice:
                    "Tạm giảm nhịp sống quá bận rộn và dành thời gian nghỉ ngơi. Tập các hoạt động giúp thư giãn hệ thần kinh như thiền, hít thở sâu, yoga. Viết nhật ký hoặc chia sẻ cảm xúc với người bạn tin tưởng. Hạn chế các yếu tố làm tăng stress như thiếu ngủ, caffeine, làm việc quá sức.",
            };
        }

        if (totalScore <= 67) {
            return {
                level: "Trầm cảm trung bình",
                color: "text-orange-600",
                bgColor: "bg-orange-50",
                borderColor: "border-orange-200",
                description:
                    "Các dấu hiệu mệt mỏi, lo lắng hoặc buồn bã đang ảnh hưởng đáng kể đến cảm xúc và sinh hoạt hàng ngày. Bạn nên cân nhắc dành thời gian phục hồi tinh thần, chia sẻ với người đáng tin cậy hoặc tìm sự hỗ trợ chuyên môn nếu cần.",
                advice:
                    "Chủ động tìm người để chia sẻ cảm xúc. Thiết lập lại nhịp sinh hoạt và nghỉ ngơi. Dành thời gian cho các hoạt động giúp phục hồi tinh thần như đi bộ trong thiên nhiên, thiền hoặc retreat. Cân nhắc trao đổi với chuyên gia tâm lý để được hỗ trợ chuyên sâu.",
            };
        }

        return {
            level: "Trầm cảm nặng",
            color: "text-red-600",
            bgColor: "bg-red-50",
            borderColor: "border-red-200",
            description:
                "Bạn đang trải qua mức độ căng thẳng và kiệt sức tinh thần cao. Những cảm xúc tiêu cực có thể đang ảnh hưởng mạnh đến cuộc sống và sức khỏe của bạn. Việc tìm sự hỗ trợ từ chuyên gia tâm lý hoặc các chương trình chăm sóc tinh thần là điều rất quan trọng lúc này.",
            advice:
                "Trao đổi trực tiếp với chuyên gia tâm lý hoặc bác sĩ tâm thần. Không cố gắng tự đối mặt một mình trong thời gian dài. Tìm một môi trường an toàn và hỗ trợ để nghỉ ngơi và phục hồi. Hạn chế những yếu tố gây áp lực trong giai đoạn này.",
        };
    }

    if (totalScore <= 22) {
        return {
            level: "Little or no sign of depression",
            color: "text-green-600",
            bgColor: "bg-green-50",
            borderColor: "border-green-200",
            description:
                "Your mental well-being appears relatively stable. Small stresses may still arise in daily life, but overall you seem to be maintaining a healthy balance.",
            advice:
                "Maintain regular sleep and daily routines. Spend time on activities that bring you joy. Move your body regularly or spend time in nature. Stay connected with trusted friends, family, or community.",
        };
    }

    if (totalScore <= 45) {
        return {
            level: "Mild depression",
            color: "text-yellow-600",
            bgColor: "bg-yellow-50",
            borderColor: "border-yellow-200",
            description:
                "You may be experiencing some signs of stress, low mood, or emotional fatigue. This can be common during demanding periods of life. It may be a good time to slow down and care for yourself more intentionally.",
            advice:
                "Reduce an overly busy pace and give yourself space to rest. Practice calming activities such as meditation, deep breathing, or yoga. Journal or share your feelings with someone you trust. Limit factors that increase stress, such as lack of sleep, caffeine, or overwork.",
        };
    }

    if (totalScore <= 67) {
        return {
            level: "Moderate depression",
            color: "text-orange-600",
            bgColor: "bg-orange-50",
            borderColor: "border-orange-200",
            description:
                "Feelings of tiredness, anxiety, or sadness may be affecting your emotions and daily functioning in a more noticeable way. It may be helpful to intentionally create time for emotional recovery and seek support when needed.",
            advice:
                "Actively reach out to someone you trust and talk about how you feel. Rebuild your sleep and rest routines. Make time for restorative activities such as walking in nature, meditation, or a retreat. Consider speaking with a mental health professional for deeper support.",
        };
    }

    return {
        level: "Severe depression",
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        description:
            "You may be experiencing a high level of emotional strain and mental exhaustion. These feelings may be strongly affecting your life and health. Seeking support from a mental health professional or a caring support environment is especially important right now.",
        advice:
            "Please consider speaking directly with a psychologist, counselor, or psychiatrist. Try not to carry this alone for a long time. Find a safe and supportive environment where you can rest and recover. Reduce avoidable pressure as much as possible during this period.",
    };
}

export default function MentalHealthTestPage() {
    const { language } = useApp();
    const currentLanguage: AppLanguage = language === "en" ? "en" : "vi";

    const [testState, setTestState] = useState<TestState>("intro");
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<number[]>(
        Array(QUESTIONS[currentLanguage].length).fill(-1)
    );
    const [score, setScore] = useState<number | null>(null);
    const [aiAdvice, setAiAdvice] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const questions = useMemo(() => QUESTIONS[currentLanguage], [currentLanguage]);
    const options = useMemo(() => OPTIONS[currentLanguage], [currentLanguage]);
    const text = useMemo(() => UI_TEXT[currentLanguage], [currentLanguage]);

    const startTest = () => {
        setAnswers(Array(questions.length).fill(-1));
        setScore(null);
        setAiAdvice("");
        setCurrentQuestionIndex(0);
        setTestState("testing");
    };

    const handleOptionSelect = (value: number) => {
        const newAnswers = [...answers];
        newAnswers[currentQuestionIndex] = value;
        setAnswers(newAnswers);

        if (currentQuestionIndex < questions.length - 1) {
            setTimeout(() => {
                setCurrentQuestionIndex((prev) => prev + 1);
            }, 250);
        }
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
            return;
        }
        void calculateScore();
    };

    const handleBack = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex((prev) => prev - 1);
        }
    };

    const calculateScore = async () => {
        const totalScore = answers.reduce((a, b) => a + b, 0);
        setScore(totalScore);
        setTestState("result");
        setIsLoading(true);

        const classification = getResultClassification(totalScore, currentLanguage);

        const prompt =
            currentLanguage === "vi"
                ? `Tôi vừa hoàn thành bài test sức khỏe tinh thần và đạt ${totalScore}/90 điểm. Kết quả của tôi thuộc mức: "${classification.level}".
Dựa trên kết quả này và các dịch vụ du lịch chữa lành, thiền định, khóa học tâm lý của An Tịnh Việt, hãy đưa ra một vài lời khuyên ngắn gọn, ấm áp và gợi ý 1-2 tour hoặc khóa học phù hợp nhất để giúp tôi cải thiện sức khỏe tinh thần. Hãy trả lời bằng tiếng Việt, dùng markdown để định dạng đẹp, giọng điệu dịu dàng và không phán xét.`
                : `I have completed a mental health assessment and scored ${totalScore}/90. My result falls into the level: "${classification.level}".
Based on this result and An Tinh Viet's healing travel services, meditation retreats, and psychology-related courses, please provide a few short, warm suggestions and recommend 1-2 suitable tours or courses that may support my mental well-being. Please answer in English, use markdown for clean formatting, and keep the tone gentle and non-judgmental.`;

        try {
            const response = await sendMessageToGeminiServer({
                history: [],
                newMessage: prompt,
                language: currentLanguage,
                toursBrief: "",
            });
            setAiAdvice(response);
        } catch (error) {
            console.error("Error getting AI advice:", error);
            setAiAdvice(
                currentLanguage === "vi"
                    ? "Xin lỗi, hiện tại không thể kết nối với AI để lấy lời khuyên. Vui lòng thử lại sau."
                    : "Sorry, we cannot connect to AI for guidance right now. Please try again later."
            );
        } finally {
            setIsLoading(false);
        }
    };

    const resetTest = () => {
        setAnswers(Array(questions.length).fill(-1));
        setScore(null);
        setAiAdvice("");
        setTestState("intro");
        setCurrentQuestionIndex(0);
    };

    const currentResult =
        score !== null ? getResultClassification(score, currentLanguage) : null;

    return (
        <div className="min-h-screen bg-sand-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {testState === "intro" && (
                    <div className="bg-white rounded-3xl shadow-sm p-10 md:p-16 text-center border border-sand-100 animate-fade-in">
                        <div className="w-full max-w-[240px] sm:max-w-[320px] h-20 sm:h-24 md:h-28 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-8 px-3">
                            <img
                                src="/logongang.png"
                                alt="Mental Test"
                                className="max-w-full max-h-full object-contain"
                            />
                        </div>

                        <h1 className="text-4xl font-serif font-bold text-earth-900 mb-6">
                            {text.title}
                        </h1>

                        <p className="text-stone-600 text-lg mb-10 leading-relaxed max-w-2xl mx-auto">
                            {text.intro}
                        </p>

                        <Button size="lg" onClick={startTest} className="px-12 text-lg">
                            {text.start}
                        </Button>
                    </div>
                )}

                {testState === "testing" && (
                    <div className="bg-white rounded-3xl shadow-sm p-8 md:p-12 border border-sand-100 animate-fade-in">
                        <div className="mb-10">
                            <div className="flex justify-between text-sm text-stone-500 mb-3 font-medium uppercase tracking-wider">
                <span>
                  {text.question} {currentQuestionIndex + 1} / {questions.length}
                </span>
                                <span>
                  {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%
                </span>
                            </div>

                            <div className="w-full bg-sand-100 rounded-full h-3">
                                <div
                                    className="bg-primary h-3 rounded-full transition-all duration-500 ease-out"
                                    style={{
                                        width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
                                    }}
                                />
                            </div>
                        </div>

                        <div className="min-h-[120px] mb-8">
                            <h3 className="text-2xl md:text-3xl font-serif font-bold text-earth-900 leading-tight">
                                {questions[currentQuestionIndex]}
                            </h3>
                        </div>

                        <div className="space-y-4 mb-12">
                            {options.map((option) => {
                                const isSelected = answers[currentQuestionIndex] === option.value;

                                return (
                                    <button
                                        key={option.value}
                                        onClick={() => handleOptionSelect(option.value)}
                                        className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 ${
                                            isSelected
                                                ? "border-primary bg-primary/5 text-primary-dark shadow-sm"
                                                : "border-sand-100 hover:border-primary/30 hover:bg-sand-50 text-stone-700"
                                        }`}
                                    >
                                        <div className="flex items-center">
                                            <div
                                                className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center flex-shrink-0 ${
                                                    isSelected ? "border-primary" : "border-stone-300"
                                                }`}
                                            >
                                                {isSelected && <div className="w-3 h-3 bg-primary rounded-full" />}
                                            </div>

                                            <span className="font-medium text-lg">{option.label}</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="flex justify-between items-center pt-8 border-t border-sand-100">
                            <Button
                                variant="ghost"
                                onClick={handleBack}
                                disabled={currentQuestionIndex === 0}
                                className={
                                    currentQuestionIndex === 0
                                        ? "opacity-0 pointer-events-none"
                                        : "text-stone-500 hover:text-earth-900"
                                }
                            >
                                <ArrowLeft className="w-5 h-5 mr-2" />
                                {text.back}
                            </Button>

                            <Button
                                onClick={handleNext}
                                disabled={answers[currentQuestionIndex] === -1}
                                className="px-8"
                            >
                                {currentQuestionIndex === questions.length - 1
                                    ? text.viewResult
                                    : text.next}
                                {currentQuestionIndex !== questions.length - 1 && (
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                )}
                            </Button>
                        </div>
                    </div>
                )}

                {testState === "result" && score !== null && currentResult && (
                    <div className="space-y-8 animate-fade-in">
                        <div
                            className={`bg-white rounded-3xl shadow-sm p-8 border-t-8 ${currentResult.borderColor}`}
                        >
                            <div className="text-center mb-8">
                                <p className="text-stone-500 font-bold uppercase tracking-wider mb-2">
                                    {text.yourScore}
                                </p>

                                <div className="text-6xl font-serif font-bold text-earth-900 mb-4">
                                    {score}
                                    <span className="text-2xl text-stone-400">{text.scoreSuffix}</span>
                                </div>

                                <h2 className={`text-2xl font-bold ${currentResult.color}`}>
                                    {currentResult.level}
                                </h2>
                            </div>

                            <div className={`p-6 rounded-2xl mb-8 ${currentResult.bgColor}`}>
                                <p className="text-stone-800 leading-relaxed">
                                    {currentResult.description}
                                </p>
                            </div>

                            <div>
                                <h3 className="text-xl font-serif font-bold text-earth-900 mb-4 flex items-center">
                  <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center mr-3 text-sm">
                    💡
                  </span>
                                    {text.adviceForYou}
                                </h3>

                                <ul className="space-y-3">
                                    {currentResult.advice
                                        .split(". ")
                                        .filter(Boolean)
                                        .map((item, idx) => (
                                            <li key={idx} className="flex items-start">
                                                <span className="text-primary mr-2 mt-1">•</span>
                                                <span className="text-stone-700">
                          {item.trim().endsWith(".") ? item.trim() : `${item.trim()}.`}
                        </span>
                                            </li>
                                        ))}
                                </ul>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl shadow-sm p-8 border border-sand-200">
                            <h3 className="text-xl font-serif font-bold text-earth-900 mb-6 flex items-center">
                <span className="w-8 h-8 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mr-3 text-sm">
                  ✨
                </span>
                                {text.suggestionFromBrand}
                            </h3>

                            {isLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                                    <span className="ml-3 text-stone-500">{text.loadingAdvice}</span>
                                </div>
                            ) : (
                                <div className="markdown-body prose prose-stone max-w-none">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            a: (props) => (
                                                <a className="text-primary hover:underline font-bold" {...props} />
                                            ),
                                            p: (props) => (
                                                <p className="mb-4 text-stone-700 leading-relaxed" {...props} />
                                            ),
                                            ul: (props) => (
                                                <ul className="list-disc ml-5 mb-4 text-stone-700 space-y-2" {...props} />
                                            ),
                                            strong: (props) => (
                                                <strong className="font-bold text-earth-900" {...props} />
                                            ),
                                        }}
                                    >
                                        {aiAdvice}
                                    </ReactMarkdown>
                                </div>
                            )}
                        </div>

                        <div className="text-center flex items-center justify-center gap-4">
                            <Link href="/">
                                <Button variant="ghost">{text.goHome}</Button>
                            </Link>
                            <Button variant="outline" onClick={resetTest}>
                                {text.retake}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}