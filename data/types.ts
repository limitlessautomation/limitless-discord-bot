export interface FormOption {
  label: string;
  value: string;
  description ? : string;
  textInput ? : boolean;
  corresponding_role ? : string;
}

export interface FormQuestion {
  id: string;
  label: string;
  options: FormOption[];
  questionType: 'multiSelectButton' | 'singleSelectButton';
}

export interface QuestionCategory {
  triggerValue: string;
  category: string;
}

export interface UserResponses {
  id: string;
  username: string;
  guild_member: string;
  answers: {
      question_id: string;
      response: string | string[];
  }[];
  categories: string[];
  currentQuestionIndex: number;
}

export interface FormQuestions {
  [key: string]: FormQuestion[];
}