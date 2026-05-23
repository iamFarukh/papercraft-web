import * as XLSX from 'xlsx'

export const SAMPLE_TEMPLATE_ROWS: Record<string, string>[] = [
  {
    questionTextEn: 'Add: 2/5 + 1/3. Express the answer in lowest terms.',
    questionTextHi: '2/5 + 1/3 जोड़ें। उत्तर को सरलतम रूप में लिखें।',
    questionType: 'Short Answer',
    class: '6',
    subject: 'Mathematics',
    chapter: 'Fractions',
    topic: 'Addition of Fractions',
    difficulty: 'medium',
    marks: '2',
    answer: '11/15',
    solution: 'LCM 15: 6/15 + 5/15 = 11/15',
    bloomLevel: 'apply',
    estimatedMinutes: '3',
    tags: 'rbse,fractions',
  },
  {
    questionTextEn: 'Which gas is released at the cathode during electrolysis of water?',
    questionTextHi: 'जल के विद्युत अपघटन में कैथोड पर कौन सा गैस निकलता है?',
    questionType: 'MCQ',
    class: '8',
    subject: 'Science',
    chapter: 'Chemical Effects of Electric Current',
    topic: 'Electrolysis',
    difficulty: 'easy',
    marks: '1',
    optionA: 'Oxygen',
    optionB: 'Hydrogen',
    optionC: 'Chlorine',
    optionD: 'Nitrogen',
    correctOption: 'b',
    bloomLevel: 'remember',
    estimatedMinutes: '1',
    tags: 'rbse,science',
  },
  {
    questionTextEn: 'संग्या की परिभाषा लिखिए और दो उदाहरण दीजिए।',
    questionTextHi: 'संग्या की परिभाषा लिखिए और दो उदाहरण दीजिए।',
    questionType: 'Long Answer',
    class: '7',
    subject: 'Hindi',
    chapter: 'व्याकरण — संज्ञा',
    topic: 'संग्या',
    difficulty: 'medium',
    marks: '4',
    answer: 'नाम वाले शब्द संज्ञा कहलाते हैं।',
    bloomLevel: 'understand',
    estimatedMinutes: '6',
    tags: 'hindi,grammar',
  },
  {
    questionTextEn: 'The smallest 4-digit number is ____.',
    questionTextHi: '',
    questionType: 'Fill in the Blank',
    class: '5',
    subject: 'Mathematics',
    chapter: 'Knowing Our Numbers',
    topic: 'Place Value',
    difficulty: 'easy',
    marks: '1',
    answer: '1000',
    bloomLevel: 'remember',
    estimatedMinutes: '1',
    tags: '',
  },
  {
    questionTextEn: 'Photosynthesis occurs only in the presence of sunlight.',
    questionTextHi: 'प्रकाश संश्लेषण केवल सूर्य के प्रकाश में होता है।',
    questionType: 'True/False',
    class: '7',
    subject: 'Science',
    chapter: 'Nutrition in Plants',
    topic: 'Photosynthesis',
    difficulty: 'easy',
    marks: '1',
    answer: 'true',
    bloomLevel: 'remember',
    estimatedMinutes: '1',
    tags: '',
  },
]

export function downloadSampleTemplate(format: 'csv' | 'xlsx') {
  const ws = XLSX.utils.json_to_sheet(SAMPLE_TEMPLATE_ROWS)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Questions')

  if (format === 'csv') {
    const csv = '\uFEFF' + XLSX.utils.sheet_to_csv(ws)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'papercraft-question-import-template.csv'
    a.click()
    URL.revokeObjectURL(url)
    return
  }

  XLSX.writeFile(wb, 'papercraft-question-import-template.xlsx')
}
