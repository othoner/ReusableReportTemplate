class HelperUtils
{
  static function RemoveHtml(text) 
  {  
    text = RemoveScriptTagShortcut(text);
    text = ReplaceNoBreakSpaceCodes(text);
    text = TrimText(text);
    text = CollapseMultipleSpaces(text);
    text = ReplaceScriptTags(text);
    text = ReplaceHTMLCharacters(text);     
    return text;
  }
  
  static function RemoveScriptTagShortcut(text)
  {
    var scriptRemovedArray = text.split('<script>');
    if (scriptRemovedArray.length > 1) 
      text = scriptRemovedArray[0] + ' ' + scriptRemovedArray[1].split('</script>')[1];
    return text;
  }
  
  static function ReplaceNoBreakSpaceCodes(text)
  {
    var nobreakspace_codes = ['&#160;', '&nbsp;', String.fromCharCode(160)];
    for (var i = 0; i < nobreakspace_codes.length; ++i)
      text = text.split(nobreakspace_codes[i]).join(' ');
    return text;
  }
  
  static function TrimText(text)
  {
    return text.replace(/\<.+?\>/g, '');
  }
  
  static function CollapseMultipleSpaces(text)
  {
    return text.replace(/^\s+|\s+$/g,'');
  }
  
  static function ReplaceScriptTags(text) 
  {
    return text.replace(/<script[^>]*>.*?<\/script>/ig, '');
  }
  
  static function ReplaceHTMLCharacters(text)
  {
    var SCRIPT_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
    while (SCRIPT_REGEX.test(text)) 
    {
      text = text.replace(SCRIPT_REGEX, "");
    }
    return text;
  }
  
  static function SortTableByColumn (table, column_index)
  {
    var sortInfo : SortInfo = new SortInfo();  
    sortInfo.Enabled = true;
    sortInfo.Direction = TableSortDirection.Descending;
    sortInfo.SortByType = TableSortByType.Position;
    sortInfo.Position = column_index;
    table.Sorting.Rows = sortInfo;
  }
  
  
	static function UpdateDateFormatByTable ( table, log ) {
		var header_collection = [];
		for (var i=0; i<table.RowHeaders.Count; ++i)
			header_collection.push( table.RowHeaders[i] );
			
		for (var i=0; i<table.ColumnHeaders.Count; ++i)
			header_collection.push( table.ColumnHeaders[i] );
		
		UpdateDateFormatByHeaderCollection ( header_collection, log );
	}
  

	private static function UpdateDateFormatByHeaderCollection( collection, log ) {
		// Loop over collection
		for (var i=0; i<collection.length; ++i) {
			// Update current Header
          	var header = collection[i];
          	
          	
			if (header.HeaderType == HeaderVariableType.QuestionnaireElement) {
              	header.TimeSeries.FlatLayout = true;
				header.TimeSeries.DateFormat = TimeSeriesDateFormatType.Custom;
				header.TimeSeries.CustomFormat = Config.CustomDateFormat;
                /*
              	header.TimeSeries.Time1 =  TimeseriesTimeUnitType.Year;
                header.TimeSeries.Time2 =  TimeseriesTimeUnitType.Month;
                header.TimeSeries.Time2 =  TimeseriesTimeUnitType.DayOfMonth;
				*/
            }
          
			// See if there's a match in that header's Child Branches
			var o = [];
			for (var j=0; j<collection[i].SubHeaders.Count; ++j)
				o.push( collection[i].SubHeaders[j] );
			
			UpdateDateFormatByHeaderCollection ( o );
		}
	}  
  
  
}