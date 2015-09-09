class MetaData
{
  static var surveys = {};
  
  static function GetQuestions2(report, datasourceId, includeAnswers, log)
  {
    var project : Project = report.DataSource.GetProject(datasourceId);
    var cacheKey = [datasourceId, project.ProjectId, report.CurrentLanguage].join('_');
    if(surveys[cacheKey] == null)// || (Config.MetaDataCacheMinutes != null && (surveys[cacheKey].Timestamp - DateTime.Now).TotalMinutes >= Config.MetaDataCacheMinutes))
    {
      var start = DateTime.Now;
      var questions = project.GetQuestionsWithAnswers();
      //var questions = project.GetQuestions();
      var endGetQuestions = DateTime.Now;
      var nonExcludedQuestions = CreateLocalQuestionList(questions);
      var endLoopToExclude = DateTime.Now;
      if(log)
      {
        log.LogDebug("GetCompleteQuestions: " + (endGetQuestions - start).TotalMilliseconds);
        log.LogDebug("Loop to exclude: " + (endLoopToExclude - endGetQuestions).TotalMilliseconds);
      }
      surveys[cacheKey] = {Questions:nonExcludedQuestions, Timestamp: DateTime.Now};
    }
    return surveys[cacheKey].Questions;
  }
  
  static function CreateLocalQuestionList(questions)
  {
    var localQuestions = [];      
    for(var i = 0; i < questions.length; i++)
    {      
      var question : Question = questions[i];
      if(!question.IsInCategory("exclude"))
      {
        var tempQuestion = {Text: question.Text, 
                            Title: question.Title, 
                            QuestionId: question.QuestionId,
                            QuestionType: question.QuestionType,
                            Categories: question.GetCategories()};
        
        switch(question.QuestionType)
        {
          case QuestionType.Grid:
          case QuestionType.Multi:
          case QuestionType.MultiNumeric:
          case QuestionType.MultiOpen:
          case QuestionType.MultiOrdered:
          case QuestionType.Single:
            tempQuestion.AnswerCount = question.AnswerCount;
            if(tempQuestion.AnswerCount <= 1000)
              tempQuestion.Answers = CreateAnswerList(question.GetAnswers());
            else
              tempQuestion.Answers = [];
            break;
        }

        if(question.HasScale)
        {
          tempQuestion.Scale = CreateAnswerList(question.GetScale());
        }   
        localQuestions.push(tempQuestion);       
      }
    }
    return localQuestions;
  }
 
  static function GetCategoryNames (report, datasourceId, log) 
  {   
    var categories = [];
    var questions = GetQuestions2(report, datasourceId, false, log);
    for (var i = 0; i < questions.length; ++i) 
    {  
      var cats = questions[i].Categories;
      for (var j = 0; j < cats.length; ++j) 
      {
        var category_name = cats[j];
        var found = false;
        for (var k = 0; k < categories.length; ++k)
          if (categories[k] == category_name) found = true;
        if (!found) categories.push(category_name);     
      }
    }
    return categories;
  }
  
  static function GetQuestionsByType2(report, datasourceId, questionType, includeAnswers, log)
  {
    var questionsInType = [];    
    var questions = GetQuestions2(report, datasourceId, includeAnswers, log);    
    for(var i = 0; i < questions.length; i++)
    {
      var question = questions[i];
      if(question.QuestionType == questionType)
      	questionsInType.push(question);
    }    
    return questionsInType;
  }
  
  static function GetQuestionsByTypeArray2(report, datasourceId, questionType, includeAnswers, log)
  {
    var questionsInType = [];    
    var questions = GetQuestions2(report, datasourceId, includeAnswers, log);     
    for(var i = 0; i < questions.length; i++)
    {
      var question = questions[i]; 
      for(var j = 0; j < questionType.length; j++)
      {
        if(question.QuestionType == questionType[j])
      		questionsInType.push(question);
      }
    } 
    return questionsInType;
  }
   
  static function GetQuestion2(report, datasourceId, questionId, includeAnswers, log) 
  {
    var questions = GetQuestions2(report, datasourceId, includeAnswers, log);
    questionId = questionId.toUpperCase();
    for (var i = 0; i < questions.length; ++i)
      if (questions[i].QuestionId.toUpperCase() == questionId) 
        return questions[i];
  }
   
  static function GetQuestionsByCategory2(report, datasourceId, category, includeAnswers, log)
  {
    var questionsInCategory = [];    
    var questions = GetQuestions2(report, datasourceId, includeAnswers, log);
    for(var i = 0; i < questions.length; i++)
    {
      var question = questions[i];
      if(IsInCategory(question, category))
      	questionsInCategory.push(question);
    } 
    return questionsInCategory;
  }

  static function IsInCategory(question, category)
  {
    category = category.toUpperCase();
    for(var i = 0; i < question.Categories.length; i++)
    {
      if(question.Categories[i].toUpperCase() == category)
        return true;
    }
    return false;    
  }

  static function GetAnswer(question, code)
  {
    for(var i = 0; i < question.Answers.length; i++)
    {
    	var answer = question.Answers[i];              
        if(answer.Code == code)
        	return answer;
    }    
    return null;
  }
  
  static function GetAnswers(report, datasourceId, question)
  {
    var project : Project = report.DataSource.GetProject(datasourceId);
    var reportalQuestion : Question = project.GetQuestion(question.QuestionId);
    if(reportalQuestion.AnswerCount <= 1000)
      return CreateAnswerList(reportalQuestion.GetAnswers());
    return [];
  }
  
  static function HasScores(question, log)
  {
    switch (question.QuestionType) 
    {  
      case QuestionType.Grid:
        return AnswerListHasScores(question.Scale);
        break;   
      case QuestionType.Single:
      case QuestionType.Multi:
        return AnswerListHasScores(question.Answers);
        break;
    }
  }
  
  static function AnswerListHasScores(answers)
  {
    for(var i = 0; i < answers.length; i++)
      if(answers[i].Score != null)
        return true;
    return false;
  }

  static function CreateAnswerList(answerList)
  {
    var answers = [];    
    for(var i = 0; i < answerList.length; i++)
    {
      var reportalAnswer = answerList[i];
      var answer = {Code: reportalAnswer.Precode,
                    Text: reportalAnswer.Text,
                    Score: reportalAnswer.Weight};
      answers.push(answer);
    }  
    return answers;
  }
}