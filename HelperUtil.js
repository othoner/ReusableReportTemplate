class HelperUtil
{ 
  static function ReplaceColumnHeadersById(table, id, newHeader, log)
  {
    ReplaceMatches(table.ColumnHeaders, id, newHeader, log);
  }
  
  static function ReplaceMatches(headersCollection, id, newHeader, log) 
  {
	for (var i = 0; i < headersCollection.Count; ++i) 
    {  
	  if (headersCollection[i].HeaderId == id)
      {
        var tempHeader = newHeader;
        if(tempHeader.SubHeaders == null || tempHeader.SubHeaders.Count == 0)
          tempHeader.SubHeaders.AddRange(headersCollection[i].SubHeaders);
        headersCollection[i] = tempHeader;
        tempHeader = null;
      }
	  // See if there's a match in that header's Child Branches
	  if(headersCollection[i].SubHeaders != null)
        ReplaceMatches(headersCollection[i].SubHeaders, id, newHeader, log);
    }
  }
  
  static function SetFormulasFirstById(table, id, formulasFirst, log)
  {
    SetFormulasFirst(table.RowHeaders, id, formulasFirst, log);
  }
  
  static function SetFormulasFirst(headersCollection, id, formulasFirst, log) 
  {
	for (var i = 0; i < headersCollection.Count; ++i) 
    {
	  if (headersCollection[i].HeaderId == id)
      {
        headersCollection[i].Mask.ApplyAfterFormulas = formulasFirst;
      }
	  // See if there's a match in that header's Child Branches
	  if(headersCollection[i].SubHeaders != null)
        SetFormulasFirst(headersCollection[i].SubHeaders, id, formulasFirst, log);
    }
  }

  static function GetColumnHeadersById(table, id, log) 
  {
	var headers = [];
	for (var i = 0; i < table.ColumnHeaders.Count; ++i) 
      headers.push(table.ColumnHeaders[i]);
	return FindMatches (headers, id, log);
  }
  
  static function GetRowHeadersById(table, id, log) 
  {
	var headers = [];
	for (var i = 0; i < table.RowHeaders.Count; ++i) 
      headers.push(table.RowHeaders[i]);
	return FindMatches (headers, id, log);
  }
  
  static function FindMatches(headersCollection, id, log) 
  {
    var foundHeaders = [];
	for (var i = 0; i < headersCollection.length; ++i) 
    {
      var header = headersCollection[i];
	  if (header.HeaderId == id)
        foundHeaders.push(header);
	  // See if there's a match in that header's Child Branches
	  var subHeaders = [];
	  for (var j = 0; j < header.SubHeaders.Count; ++j) 
        subHeaders.push(header.SubHeaders[j]);
	  var matches = FindMatches(subHeaders, id, log);
	  if (matches != null) 
        foundHeaders = foundHeaders.concat(matches);
	}
	return foundHeaders;
  }
  
  static function GetHeaderById(table, id, log) 
  {
    if (log) 
      log.LogDebug("GHBId");
	var o = [];
	for (var i = 0; i < table.RowHeaders.Count; ++i) 
      o.push(table.RowHeaders[i]);
	for (var i = 0; i < table.ColumnHeaders.Count; ++i) 
      o.push(table.ColumnHeaders[i]);
	return FindMatch (o, id, log);
  }
	
  static function FindMatch(collection, id, log) 
  {
    if (log) 
      log.LogDebug("FM");
	// Loop over collection
	for (var i = 0; i < collection.length; ++i) 
    {
	  // Check current Header
	  if (log) 
        log.LogDebug("HeaderId=" + collection[i].HeaderId);
	  if (collection[i].HeaderId == id)
        return collection[i];
	  // See if there's a match in that header's Child Branches
	  var o=[];
	  for (var j = 0; j < collection[i].SubHeaders.Count; ++j) 
        o.push(collection[i].SubHeaders[j]);
	  var match = FindMatch(o, id, log);
	  if (match != null) 
        return match;
	}
	// No match
	return null;
  }
  
  static function SortAnswersByScore(a, b)
  {
    if (a.Score < b.Score) 
      return -1;
    if (a.Score == b.Score)
    {
      	if (a.Code < b.Code)
          return -1;
      	if (a.Code > b.Code)
          return 1;
      	if (a.Code == b.Code)
          return 0;
    }
    if (a.Score > b.Score)
      return 1;
  }
  
  static function RemoveHtml(txt) 
  {
    var x = HelperUtils.RemoveHtml(txt);
    var parts = x.split('^');
    for (var i=0; i<parts.length; ++i) {
     	if (i % 2 == 1) parts[i] = ' [...] '; 
    }
    return parts.join('');
  }

  static function AnalyzeVariable(project, variable_id, log)
  {  
    var min, max;
	var parts = variable_id.split('.');
	var question_id = parts[0];
		
	var question = project.GetQuestion(question_id);
	var answers;

	switch (question.QuestionType) 
    {
	  case QuestionType.Grid:
	    answers = question.GetScale();
	    break;
 
	  default:
	    answers = question.GetAnswers();
	}
		
	for (var i = 0; i < answers.length; ++i) 
    {
	  var score = answers[i].Weight;
	  if (score != null)
      {
	    if (min == null || score < min) 
          min = score;
	    if (max == null || score > max)
          max = score;
	  }
    }
		
	return {
	  MinScore: min,
	  MaxScore: max
	};
  }
}