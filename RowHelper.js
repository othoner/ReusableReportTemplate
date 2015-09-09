class RowHelper {

	static function GetExpression (report, state) {

		var Y=[];

		// Check Mask

      	var tots = ParamUtil.Selected(report, state, 'TOTALS');
      
		// Current Question
		var variable_ids = ParamUtil.GetParamCodes(state, 'QUESTION');

		for (var i=0; i<variable_ids.length; ++i) {

			var variable_id = variable_ids[i];
			var qid = variable_id.split('.')[0];
			var q = MetaData.GetQuestion2(report, DS.Main, qid, true);
			var v = variable_id.split('.');

			var codes = [];
			
			// Only apply mask if one question is selected for rows
			if (variable_ids.length == 1) {
				var mask_codes = ParamUtil.GetParamCodes(state, 'MASK');

				for (var i=0; i<mask_codes.length; ++i) {
					var a = mask_codes[i].split('.');
					if (a[0] == v[0])
						codes.push (a[1]);
				}
			}
			
			
			// Properties of the Question Header (rows)
			var p = [];

			p.push ('title: true');
			p.push ('totals: ' + tots.Totals);
			switch (q.QuestionType) {
				case QuestionType.Multi:
					p.push ('collapsed: true');
					break;
				
				default:
					p.push ('collapsed: false');
					break;
			}

			if (codes.length>0)
			  p.push ('xmask:' + codes.join(','));

			Y.push (variable_id + '{' + p.join(';') + '}');
          
                    
            if (ParamUtil.Selected(report, state, DS.Main, 'STATS').Statistics) {
            
            // Add Statistics
            Y.push ( [
              '[SEGMENT]{label:"Statistics"}',
              variable_id + '{collapsed:true; hideheader:true}',
                  '[STAT]{stats:avg,stdev}'
              ].join('/'));
            }       
		}
		return Y.join('+');
	} 
}