class JsonParsing
{
  static function ParseRecodingsJson(recodings)
  {
    var str = "[";
    var recodingsJson = [];
    for(var i = 0; i < recodings.length; i++)
    {
      var recodingJson = "";
      var recoding = recodings[i];
      recodingJson += "{Name:\"" + recoding.Name + "\",BaseQuestion:\"" + recoding.BaseQuestion + "\",RecodedAnswers:[";
      var recodedAnswers = []
      for(var j = 0; j < recoding.RecodedAnswers.length; j++)
      {
        var recodedAnswer = recoding.RecodedAnswers[j];
        recodedAnswers.push("{Name:\"" + recodedAnswer.Name + "\",Codes:\"" + recodedAnswer.Codes + "\"}");        
      }
      recodingJson += recodedAnswers.join(",");
      recodingJson +="]}";
      recodingsJson.push(recodingJson);
    }
    str += recodingsJson.join(",");
    str += "]";
    return str;
  }
  
  static function ParseQuestionsToJson(questions)
  {
    var str = "[";
    var questionsJson = [];
    for(var i = 0; i < questions.length; i++)
    {
      var questionJson = "";
      var question = questions[i];
      if(question.QuestionType == QuestionType.Grid)
      {
        for(var j = 0; j < question.Answers.length; j++)
        {
          questionJson = "";
          var answer = question.Answers[j];
          var questionId = question.QuestionId + "." + answer.Code;
          questionJson += "{\"QuestionId\":\"" + questionId + "\",\"Title\":\"" + CleanText(answer.Text) + "\",\"Answers\":[";
          var answers = [];
          for(var k = 0; k < question.Scale.length; k++)
          {
            var scale = question.Scale[k];
            answers.push("{\"Code\":\"" + scale.Code + "\",\"Text\":\"" + CleanText(scale.Text) + "\"}");
          }
          questionJson += answers.join(",");
          questionJson +="]}";
          questionsJson.push(questionJson);
        }
      }
      else
      {
        questionJson += "{\"QuestionId\":\"" + question.QuestionId + "\",\"Title\":\"" + CleanText(question.Title) + "\",\"Answers\":[";
        var answers = []
        for(var j = 0; j < question.Answers.length; j++)
        {
          var answer = question.Answers[j];
          answers.push("{\"Code\":\"" + answer.Code + "\",\"Text\":\"" + CleanText(answer.Text) + "\"}");        
        }
        questionJson += answers.join(",");
        questionJson +="]}";
        questionsJson.push(questionJson);
      }
    }
    str += questionsJson.join(",");
    str += "]";
    return str;
  }
  
  static function CleanText(text)
  {
    return text.split("\"").join("").split("\n").join("");
  }
}