class ParamLists
{
  static function AnswersToParamValues (report, questionId, label) 
  {
	var answerParameterValues = [];
    var project = report.DataSource.GetProject(DS.Main);
    var question = project.GetQuestion(questionId);
  	if (label == null) 
      label = question.Title;

    var answers = question.GetAnswers();
    for (var i = 0; i < answers.length; ++i) 
    {
      answerParameterValues.push (
        {
          Label: answers[i].Text,
          Code: answers[i].Precode
        }
      );
    }
    return answerParameterValues;
  }

  static function Get(parameterName, state, report, optional, log)
  { 
    switch (parameterName.toUpperCase())
    { 
      case 'COMPLETIONPAGE_UNIT':
        return GetCompletionTrackingPageUnit();
      case 'TRENDPAGE_UNIT':
        return GetTrendPageUnit2();
      case 'TRENDPAGE_STATISTIC':
        return GetTrendPageStatistic()       
      case "TRENDING_INTERVAL":
      case "TRENDPAGE_INTERVAL":
        return GetTrendPageInterval();
      case "CROSSTAB_TRENDING":
      case 'SCORECARD_TRENDING':
        return GetTrendingOptions(); 
      case 'QUESTION':
      case 'QUESTIONS':
      case 'ONE_QUESTION':
        return GetQuestionList(report, log);
      case 'OPERATOR':
        return GetOperator();       
	  case 'FILTER':
        return GetFilterOptions(report, optional, log);
      case 'TRENDUNIT':
          return GetTrendUnitOptions();
      case 'SIGTEST':
        return GetSigtestOptions();        
      case 'TRENDING':
        return GetTrendingToggleOptions();        
      case 'TOTALS':
        return GetTotalsToggleOptions();        
      case 'L1_MASK':
      case 'L2_MASK':
      case 'L3_MASK':
      case 'L4_MASK':
        return AnswerList(parameterName, state, report);        
      case 'L1':
      case 'L2':
      case 'L3':
      case 'L4':
        var questions = MetaData.GetQuestions2(report, DS.Main, true);
		return SEGMENT(questions, true); 
      case 'L1_OPTIONS':
      case 'L2_OPTIONS':
      case 'L3_OPTIONS':
      case 'L4_OPTIONS':
        return GetMaskingOptions();
      case 'SCORECARD_NESTING':
        return GetNestingOptions(report, log);
      case "TRENDLABELS":
      case "COMPLETIONLABELS":
        return GetLabelToggleOptions();
      case "SCORECARD_STATISTICS":
        return GetScorecardStatistics();
      case "DECIMALS":
        return GetDecimalsOptions();
      case "STATS":
        return GetStatsOptions();
      case "BASE":
        return GetBaseOptions();
    }   
  }
  
  private static function GetBaseOptions()
  {
   	return [
      {Code: '1', Label: 'Base: On', N: true, Percent: true},
      {Code: '2', Label: 'Base: Off', N: false, Percent: true}
   	];
  }
  
  private static function GetStatsOptions()
  {
   	return [
      {Code: '1', Label: 'Statistics: On', Statistics: true},
      {Code: '2', Label: 'Statistics: Off', Statistics: false}
   	];
  }
  
  private static function GetDecimalsOptions()
  {
   	return [
      {Code: '0', Label: 'Decimals: 0', Decimals: 0},
      {Code: '1', Label: 'Decimals: 1', Decimals: 1},
      {Code: '2', Label: 'Decimals: 2', Decimals: 2},
      {Code: '3', Label: 'Decimals: 3', Decimals: 3},
    ];
  }
  
  private static function GetScorecardStatistics()
  {
    return [
      		{Code: "0", Label: "Base"},
            {Code: "1", Label: "Average"},
            {Code: "2", Label: "St. Dev."},
            {Code: "7", Label: "Top Box"},
            {Code: "3", Label: "Top 2 NET"},
            {Code: "4", Label: "Top 3 NET"},
            {Code: "8", Label: "Bottom Box"},
            {Code: "5", Label: "Bottom 2 NET"},
            {Code: "6", Label: "Bottom 3 NET"}
          ]; 
  }
  
  private static function GetNestingOptions(report, log)
  {
    var nestingQuestions = ReportMetaData.GetDemoQuestions(report, DS.Main, log);
    var parameterValues = [];
    for(var i = 0; i < nestingQuestions.length; i++)
    {
      var question = nestingQuestions[i];
      switch(question.QuestionType)
        {
          case QuestionType.Single:
          case QuestionType.Multi:  
            parameterValues.push(CreateSimpleParameterValue(question));
            break;
          case QuestionType.Grid:
            var answers = MetaData.GetAnswers(report, DS.Main, question);
            //var answers = question.Answers;
            for(var j = 0; j < answers.length; j++)
            {
              parameterValues.push(CreateGridParameterValue(question, answers[j]));
            }
            break;
        }
    }
    return parameterValues;
  }

  private static function GetFilterOptions(report, index, log)
  {
    var filters = ReportMetaData.GetFilterQuestions(report, DS.Main, log);
    if(index <= filters.length)
    {
      var questionId = filters[index-1].QuestionId;
      return AnswersToParamValues(report, questionId, null);
    }
    return null;
  } 
  
  static function AnswerList(param_name, state, report)
  {
    var param_values = [];
    var project = report.DataSource.GetProject(DS.Main);
    var param_prefix = param_name.split('_')[0]; // e.g. L1
    var question_id = ParamUtil.GetParamCode(state, param_prefix);
    var question : Question = project.GetQuestion(question_id);
    var answers = question.GetAnswers();
    for (var i=0; i<answers.length; ++i) {
     	param_values.push (
          {
            Code: question_id + '.' + answers[i].Precode,
            Label: answers[i].Text
          }
        );
    }
    return param_values;
  }
  
  static function GetMaskingOptions()
  {
   	return [
      {Code:"1", Label:"Show All"},
      {Code:"2", Label:"Select Items"},
      {Code:"3", Label:"Hide Items"}
     ];
  }
  
  static function Demographics(report)
  {
    var qids = ['Age', 'Q1', 'Q4', 'First_Visit', 'hindustry'];
    var param_values = [];
    var project = report.DataSource.GetProject(DS.Main);
    for (var i=0; i<qids.length; ++i) {
      var question : Question = project.GetQuestion(qids[i]);
      param_values.push (
        {
          Label: question.Title,
          Code: question.QuestionId
        }
       );
    }
    return param_values;
  }  
  
  static function GetQuestionList(report, log)
  {
    var parameterValues = [];
    var questions = MetaData.GetQuestions2(report, DS.Main, true, log);
    for (var i = 0; i < questions.length; ++i)
    {
      var question = questions[i];
      parameterValues = parameterValues.concat(QuestionLists.CreateParameterValues(question));
    }
    return parameterValues;    
  }
  
  static function GetTrendingOptions()
  {
    return [
            {Code: 'ALL', Label: 'All Data'},
            {Code: '1', Label: 'Current Year', Unit: RollingUnitType.Year, Delta: 0},
            {Code: '2', Label: 'Previous Year', Unit: RollingUnitType.Year, Delta: -1},
            {Code: '3', Label: 'Current Quarter', Unit: RollingUnitType.Quarter, Delta: 0},
            {Code: '4', Label: 'Previous Quarter', Unit: RollingUnitType.Quarter, Delta: -1},
            {Code: '5', Label: 'Current Month', Unit: RollingUnitType.Month, Delta: 0},
            {Code: '6', Label: 'Previous Month', Unit: RollingUnitType.Month, Delta: -1},
            {Code: '7', Label: 'Current Week', Unit: RollingUnitType.Week, Delta: 0},
            {Code: '8', Label: 'Previous Week', Unit: RollingUnitType.Week, Delta: -1},
            {Code: '0', Label: 'Custom Dates'}
          ];
  }
  
  static function GetTrendPageUnit()
  {
    return [
            {Code:"1", Label: 'Week', Unit: TimeseriesTimeUnitType.Week},
            {Code:"2", Label: 'Month', Unit: TimeseriesTimeUnitType.Month},
            {Code:"3", Label: 'Quarter', Unit: TimeseriesTimeUnitType.Quarter},
            {Code:"4", Label: 'Year', Unit: TimeseriesTimeUnitType.Year}
          ];  
  }
  
  static function GetTrendPageUnit2()
  {
    return [
            {Code:"1", Label: 'Week', Unit: RollingUnitType.Week, Delta: 0},
            {Code:"2", Label: 'Month', Unit: RollingUnitType.Month, Delta: 0},
            {Code:"3", Label: 'Quarter', Unit: RollingUnitType.Quarter, Delta: 0},
            {Code:"4", Label: 'Year', Unit: RollingUnitType.Year, Delta: 0}
          ];  
  }
  
  static function GetCompletionTrackingPageUnit()
  {
    return [
            {Code:"0", Label: 'Day', Unit: RollingUnitType.Day, Delta: 0},
            {Code:"1", Label: 'Week', Unit: RollingUnitType.Week, Delta: 0},
            {Code:"2", Label: 'Month', Unit: RollingUnitType.Month, Delta: 0},
            {Code:"3", Label: 'Quarter', Unit: RollingUnitType.Quarter, Delta: 0},
            {Code:"4", Label: 'Year', Unit: RollingUnitType.Year, Delta: 0}
          ];  
  }
  
  static function GetTrendPageStatistic()
  {
    return [
            {Code: "1", Label: "Average"},
            {Code: "2", Label: "St. Dev."},
            {Code: "7", Label: "Top Box"},
            {Code: "3", Label: "Top 2 NET"},
            {Code: "4", Label: "Top 3 NET"},
            {Code: "8", Label: "Bottom Box"},
            {Code: "5", Label: "Bottom 2 NET"},
            {Code: "6", Label: "Bottom 3 NET"}
          ];
  }
  
  static function GetTrendPageInterval()
  {
    return [
            {Code:'0', Label:'(Show All)'},
            {Code:'2', Label:'2', Interval: 2},
            {Code:'3', Label:'3', Interval: 3},
            {Code:'4', Label:'4', Interval: 4},
            {Code:'5', Label:'5', Interval: 5},
            {Code:'6', Label:'6', Interval: 6},
            {Code:'7', Label:'7', Interval: 7},
            {Code:'8', Label:'8', Interval: 8},
            {Code:'9', Label:'9', Interval: 9},
            {Code:'10', Label:'10', Interval: 10},
            {Code:'11', Label:'11', Interval: 11},
            {Code:'12', Label:'12', Interval: 12}
          ];
  }
   
  static function GetOperator()
  {
    return [ 
            {Code:'1', Label:'Nesting', Operator:'/'},
            {Code:'2', Label:'Side By Side', Operator:'+'}
          ];
  }
  
  static function GetSigtestOptions()
  {
    if(Config.Include80PctSigTesting == true)
      return [
             {Code:'1', Label:'Sig: Off', Enabled:false }, 
             {Code:'2', Label:'Sig: T-Test 80%', Enabled:true, Type: SignificanceTestType.TTest, ConfidenceLevel:ConfidenceLevel.Eighty},
             {Code:'3', Label:'Sig: T-Test 95%', Enabled:true, Type: SignificanceTestType.TTest, ConfidenceLevel:ConfidenceLevel.NinetyFive},
             {Code:'4', Label:'Sig: T-Test 99%', Enabled:true, Type: SignificanceTestType.TTest, ConfidenceLevel:ConfidenceLevel.NinetyNine},
             {Code:'5', Label:'Sig: Chi-Square', Enabled:true, Type: SignificanceTestType.ChiSquare}//,
             //{Code:'5', Label:'Sig: Z-Test 95%', Enabled:true, Type: null, ConfidenceLevel:ConfidenceLevel.NinetyFive},
             //{Code:'6', Label:'Sig: Z-Test 99%', Enabled:true, Type: null, ConfidenceLevel:ConfidenceLevel.NinetyNine}
           ];
    else
      return [
             {Code:'1', Label:'Sig: Off', Enabled:false },     
             {Code:'2', Label:'Sig: T-Test 95%', Enabled:true, Type: SignificanceTestType.TTest, ConfidenceLevel:ConfidenceLevel.NinetyFive},
             {Code:'3', Label:'Sig: T-Test 99%', Enabled:true, Type: SignificanceTestType.TTest, ConfidenceLevel:ConfidenceLevel.NinetyNine},
             {Code:'4', Label:'Sig: Chi-Square', Enabled:true, Type: SignificanceTestType.ChiSquare}//,
             //{Code:'5', Label:'Sig: Z-Test 95%', Enabled:true, Type: null, ConfidenceLevel:ConfidenceLevel.NinetyFive},
             //{Code:'6', Label:'Sig: Z-Test 99%', Enabled:true, Type: null, ConfidenceLevel:ConfidenceLevel.NinetyNine}
           ]
  }
  
  static function GetTrendUnitOptions()
  {
    return [
             {Label: 'Month', Code: TrendUnit.Month},
             {Label: 'Quarter', Code: TrendUnit.Quarter},
             {Label: 'Year', Code: TrendUnit.Year}
           ];
  }
  
  static function GetTrendingToggleOptions()
  {
    return [
             {Code:'1', Label:'Trends: Off', Trending:false},
             {Code:'2', Label:'Trends: On', Trending:true}
           ];
  }
  
  static function GetTotalsToggleOptions()
  {
    return [
             {Code:'1', Label:'Totals: On', Totals:true},
             {Code:'2', Label:'Totals: Off', Totals:false}
           ];
  }
  
  static function GetLabelToggleOptions()
  {
    return [
             {Code:'1', Label:'Off', Totals:true},
             {Code:'2', Label:'On', Totals:false}
           ];
  }
  
  static function GEO(questions)
  {
    return GEO_VARIABLES(questions);
  }
  
  static function METRIC(questions, log)
  {
    return MetricVars(questions, log);
  }
  static function DRIVER(questions)
  {
    return MetricVars(questions);
  }
  static function OUTCOME(questions)
  {
    return MetricVars(questions);
  }

  static function MASK(questions, state, report)
  {
    var selected = ParamUtil.Selected(report, state, DS.Main, 'TABLEOPTIONS');
    var question = MetaData.GetQuestion2(report, DS.Main, selected.Code, true);
    var answers;
    switch (question.QuestionType) 
    {
      case QuestionType.Grid:
        answers = question.Scale;
        break;
      default:
        answers = question.Answers;
        break;
    }

    var maskedAnswers = [];
    for (var i = 0; i < answers.length; ++i)
    {
      maskedAnswers.push({
          Code: question.QuestionId + '.' + answers[i].Precode,
          Label: answers[i].Text
        });
    }
	return maskedAnswers;
  }
  
  static function DECIMALS(questions)
  {
   	return [
      {Code: '0', Label: 'Decimals: 0', Decimals: 0},
      {Code: '1', Label: 'Decimals: 1', Decimals: 1},
      {Code: '2', Label: 'Decimals: 2', Decimals: 2},
      {Code: '3', Label: 'Decimals: 3', Decimals: 3},
    ];
  }
  
  static function BASE(questions)
  {
   	return [
      {Code: '1', Label: 'Base: On', N: true, Percent: true},
      {Code: '2', Label: 'Base: Off', N: false, Percent: true}
   	];
  }
  
  static function STATS(questions)
  {
   	return [
      {Code: '1', Label: 'Statistics: On', Statistics: true},
      {Code: '2', Label: 'Statistics: Off', Statistics: false}
   	];
  }
  
  static function TRENDING_INTERVAL(questions)
  {
    return [
      {Code: "0", Label: "(No Trending)"},
      {Code: "1", Label: "2 units"},
      {Code: "2", Label: "3 units"},
      {Code: "5", Label: "6 units"}
    ]; 
  }
  
  static function SCORECARD_STATISTICS(questions)
  {
    return [
      {Code: "0", Label: "Base"},
      {Code: "1", Label: "Average"},
      {Code: "2", Label: "St. Dev."},
      {Code: "3", Label: "Top 2 NET"},
      {Code: "4", Label: "Top 3 NET"},
      {Code: "5", Label: "Bottom 2 NET"},
      {Code: "6", Label: "Bottom 3 NET"}
    ]; 
  }
  
  static function MetricVars(questions, log)
  {
    var parameterValues = [];     
    for(var i = 0; i < questions.length; i++)
    {
      var question = questions[i];      
      switch(question.QuestionType)
      {
        case QuestionType.Single:
          if(MetaData.HasScores(question))
            parameterValues.push(CreateSimpleParameterValue(question));
          break;
        case QuestionType.Grid:
          if(MetaData.HasScores(question)) 
          {
            //var answers = MetaData.GetAnswers(report, DS.Main, question);
            var answers = question.Answers;
            for(var j = 0; j < answers.length; j++)
              parameterValues.push(CreateGridParameterValue(question, answers[j]));
          }
          break;
  	  }
	}
    return parameterValues;
  }

  static function CreateSimpleParameterValue(question)
  {
    return {
             Code: question.QuestionId, 
             Label: HelperUtil.RemoveHtml (question.Title),
             Question: question
           };
  }
  
  static function CreateGridParameterValue(question, answer)
  {
    return {
             Code: question.QuestionId + "." + answer.Code, 
             Label: HelperUtil.RemoveHtml ([question.Title, answer.Text].join(' - ')),
			 Question: question
           };
  }

  static function SEGMENT(questions, hideText)
  {
    var parameterValues = [];
    for(var i = 0; i < questions.length; i++)
    {
      var question = questions[i];
      var label = hideText ? (question.Title + ' [' + question.QuestionId + ']') : ([question.Title, question.Text].join(' - '));
      switch(question.QuestionType)
      {
        case QuestionType.Single:
          parameterValues.push(CreateSimpleParameterValue(question));
          break;
      }
	}    
    return parameterValues;
  }
  
  static function VERBATIM(questions)
  {
    var parameterValues = [];      
    for(var i = 0; i < questions.length; i++)
    {
      var question = questions[i];   
      switch(question.QuestionType)
      {
        case QuestionType.OpenText: 
          parameterValues.push(CreateSimpleParameterValue(question));
          break;
      }   	 
  	}
    return parameterValues;
  }
  
  static function CROSSTAB(questions) //GetDemographicVariables(questions)   
  {
    var parameterValues = [];
    for(var i = 0; i < questions.length; i++)
    {
      var question = questions[i];     
      switch(question.QuestionType)
      {
        case QuestionType.Single:
        case QuestionType.Multi: 
          parameterValues.push(CreateSimpleParameterValue(question));
          break;
        case QuestionType.Grid:
          var answers = question.Answers;
          for(var j = 0; j < answers.length; j++)
          {
            parameterValues.push(CreateGridParameterValue(question, answers[j]));
          }
          break;
      }
	}    
    return parameterValues;
  }
  
  static function DEMO(questions)  
  {
    var parameterValues = [];
    for(var i = 0; i < questions.length; i++)
    {
      var question = questions[i];
      if(question.Categories == "demo")
      {
        switch(question.QuestionType)
        {
          case QuestionType.Single:
          case QuestionType.Multi:  
            parameterValues.push(CreateSimpleParameterValue(question));
            break;
          case QuestionType.Grid:
            var answers = question.Answers;
            for(var j = 0; j < answers.length; j++)
            {
              parameterValues.push(CreateGridParameterValue(question, answers[j]));
            }
            break;
        }
      }
	}
    
    return parameterValues;
  }
  
  static function SINGLE(questions) //GetDemographicVariables(questions)   
  {
    var parameterValues = [];
    for(var i = 0; i < questions.length; i++)
    {
      var question = questions[i];
      
      switch(question.QuestionType)
      {
        case QuestionType.Single:
          parameterValues.push(CreateSimpleParameterValue(question));
          break;
      }
	}
    
    return parameterValues;
  }
  
  static function CODED_VARIABLES(questions)   //GetCodedVariables(questions)
  {
    var parameterValues = [];
    
    for(var i = 0; i < questions.length; i++)
    {
      var question = questions[i];      
      switch(question.QuestionType)
      {
        case QuestionType.Single:
          parameterValues.push({
                            Code: question.QuestionId, 
                            Label: HelperUtil.RemoveHtml (question.Title), 
                            Collapsed: false});
          break;
        case QuestionType.Multi:  
          parameterValues.push({
                            Code: question.QuestionId, 
                            Label: question.Title, 
                            Collapsed: true});
          break;
        case QuestionType.Grid:
          var answers = question.Answers;
          for(var j = 0; j < answers.length; j++)
          {
            parameterValues.push(
              {
              	Code: question.QuestionId+"."+answers[j].Code, 
                Label: HelperUtil.RemoveHtml ([question.Title, answers[j].Text].join(' - ')), 
                Collapsed: false
              }
            );
          }
          break;
      }
    }
    
    return parameterValues;
  }
   
  static function METRIC_VARIABLES(questions)  //GetMetricVariables(questions, log)  
  {
    var parameterValues = [];
    
    for(var i=0; i < questions.length; i++)
    {
      var question = questions[i];
      var categories = question.Categories;
      var decimals = 1;
      
      for(var j=0; j < categories.length; j++)
      {
        if(categories[j].StartsWith("decimals"))
        {
          var decimalsSplit = categories[j].split(":");
          
          if(decimalsSplit.length == 2)
          {
            decimals = parseInt(decimalsSplit[1]);
          }
        }
      }
      
      for(var j=0; j < categories.length; j++)
      {
        if(categories[j].StartsWith("metric"))
        {
          var split = categories[j].split(".");
          
          if(split.length == 1)
          {
            parameterValues.push({Code: question.QuestionId,
                              Label: HelperUtil.RemoveHtml (question.Title),
                              Reverse: MetaData.IsInCategory(question, "reverse"),
                              Decimals: decimals});  
          }
          else
          {
            var answer = MetaData.GetAnswer(question, split[1]);
 
            parameterValues.push({Code: question.QuestionId + "." + answer.Code,
                              Label: HelperUtil.RemoveHtml ([question.Title, answer.Text].join(' - ')),
                              Reverse: MetaData.IsInCategory(question, "reverse." + answer.Code),
                              Decimals: decimals});
          }
        }
      }       
    }
    
    return parameterValues;    
  }
  
  static function GEO_VARIABLES(questions)   //GetGeoVariables(questions)  
  {
    var parameterValues = [];
    
  	for(var i = 0; i < questions.length; i++)
    {
      var question = questions[i];
      
      var categories = question.Categories;
      
      var region;
      for(var j=0; j < categories.length; j++)
      {
        if(categories[j].StartsWith("geo."))
        {
          var geoSplit = categories[j].split(".");
          
          if(geoSplit.length == 2)
          {
            region = geoSplit[1];
            switch(region)
            {
              case "europe":
                parameterValues.push({
                                  Code: question.QuestionId, 
                                  Label: HelperUtil.RemoveHtml (question.Title), 
                                  Region: "150", 
                                  Resolution: "countries"});
                break;
              case "us":
                parameterValues.push({
                                  Code: question.QuestionId, 
                                  Label: HelperUtil.RemoveHtml (question.Title), 
                                  Region: "US", 
                                  Resolution: "provinces"}); 
                break;                      
              case "world":
                parameterValues.push({
                                  Code: question.QuestionId, 
                                  Label: HelperUtil.RemoveHtml (question.Title), 
                                  Region: "world", 
                                  Resolution: "countries"});
                break;
              default:
                parameterValues.push({
                                  Code: question.QuestionId, 
                                  Label: HelperUtil.RemoveHtml (question.Title), 
                                  Region: region, 
                                  Resolution: "countries"});
                break;
            }
          }
        }
      }
    }    
    return parameterValues;
  }  
}