//MIT Licensed
//Credits: Concept and Design - Idan Abarbanel

define(function (require, exports, module) {




    var CommandManager = brackets.getModule("command/CommandManager"),
		EditorManager		= brackets.getModule('editor/EditorManager'),
        Menus = brackets.getModule("command/Menus"),
        PanelManager = brackets.getModule("view/WorkspaceManager"),
        ExtensionUtils = brackets.getModule("utils/ExtensionUtils"),
        AppInit = brackets.getModule("utils/AppInit"),
		PreferencesManager = brackets.getModule( 'preferences/PreferencesManager' ),
		preferences = PreferencesManager.getExtensionPrefs( 'color.pal' );

    var VIEWCALC_EXECUTE = "ColorPal.execute";
    var panel;
	var arra;
    var panelHtml = require("text!panel.html");
    var $calcIcon = $('<a href="#" title="ColorPal" id="brackets-pal-icon"></a>');

	// Define preferences.
    preferences.definePreference( 'amount', 'int', 0 );
	
    function handleThePanel() {
        if (panel.isVisible()) {
            panel.hide();
            $calcIcon.removeClass('active');
            CommandManager.get(VIEWCALC_EXECUTE).setChecked(false);
        } else {
            panel.show();
            $calcIcon.addClass('active');
            CommandManager.get(VIEWCALC_EXECUTE).setChecked(true);
        }
    }
	
	function hideTop(val){
		if(val){
			$( '#lab' ).css("display", "none");
			$( '#show' ).css("display", "block")
		}else{
			$( '#lab' ).css("display", "block");
			$( '#show' ).css("display", "none")
		}
	}

	function checkColor(){
		
		var colVal = $("#vari").val();
		
		if(colVal.charAt(0) != "#"){
			colVal = "#" + colVal;
		}
		
		var chg = false;
		
		if(colVal.length > 7){
			colVal = colVal.substr(0, 7);
			chg = true;
		}
		
		if(!checkHex(colVal)){
			alert("Bitte geben Sie einen Hex-Farbcode an. (#0f0f0f)");
			return;
		}
		
		$("#vari").val(colVal);
		if(chg == true) $("#vari").css('background-color', '#FF7755');
		else $("#vari").css('background-color', '#FFFFFF');
		
		addColor(colVal);
		
	}
	
	function checkHex(value){
		return /^#([A-Fa-f0-9]{3}$)|([A-Fa-f0-9]{6}$)/.test(value)
	}
	
	function addColor(col) {			
		
			$( '#fi' ).append( '<div class="feld" title="'+col+'"> </div>' );
			
			var elms = $( '.feld' );
			arra = $.makeArray( elms );
			//arra.reverse();
		
			// neuste Element bearbeiten
			var n = $( arra ).length -1;
			//alert(n);
		
			var newest = $( arra ).eq(n);
			newest.css("background-color", col);
			newest.html('<div class="delbtn"> <div class="delimg"></div> </div>')
			newest.click(function() {
				copyThat(col);
			});
			
			newest.children().click(function(){
				delThat(n);
			});
		
		
			// speichern
			preferences.set('amount', ($( arra ).length));
		
			preferences.definePreference( 'col'+n, 'string', "#fff" );
			preferences.set( 'col'+n, col );
        	preferences.save();
	}
	
	function copyThat(farbe){
		copyToClipboard(farbe);
		insertStringToEditor(farbe);
	}
	
	function delThat(ind){
		$( arra ).eq(ind).remove();
		
		preferences.set('amount', ($( arra ).length));
		preferences.set( 'col'+ind, "not");
		preferences.save();
	}
	
	function copyToClipboard(text) {
		var $textarea = $('<textarea/>').text(text);
		$('body').append($textarea);
		$textarea.select();
		document.execCommand('copy');
		$textarea.remove();
	}
	
	function insertStringToEditor(string) {
		var editor = EditorManager.getFocusedEditor() || EditorManager.getActiveEditor();
		if (!editor) {
			return false;
		}
		
		if (!editor.hasFocus()) {
			editor.focus();
		}

		if (editor.getSelectedText().length > 0) {
			var selection = editor.getSelection();
			if (editor.getSelectedText().substr(0, 1) !== '#' && string.substr(0, 1) === '#') {
				editor.document.replaceRange(string.substr(1), selection.start, selection.end);
			} else {
				editor.document.replaceRange(string, selection.start, selection.end);
			}
		} else {
			var pos = editor.getCursorPos();
			editor.document.replaceRange(string, {
				line: pos.line,
				ch: pos.ch
			});
		}
	}

	// RAM speichersystem
	function load(){
		var saveAm = preferences.get( 'amount' );
		
		for(var d = 0; d< saveAm; d++){
			
			var colPref = preferences.get( 'col'+d );
			if(colPref!= "not"){
				addColor(colPref);
			}
			
		}
	}
	
    AppInit.appReady(function () {

        /*Settings*/
        ExtensionUtils.loadStyleSheet(module, "main.css");
        CommandManager.register("Show ColorPal", VIEWCALC_EXECUTE, handleThePanel);

        var menu = Menus.getMenu(Menus.AppMenuBar.VIEW_MENU);
        menu.addMenuItem(VIEWCALC_EXECUTE, 'Ctrl-Alt-V');

        panel = PanelManager.createBottomPanel(VIEWCALC_EXECUTE, $(panelHtml), 0);
        /*Settings Until Here*/


        /*Events*/
		var	todo = $("#mainpanel");
		
		todo.on('click', '#btna',function(){
			checkColor();
        });
		
        $calcIcon.click(function () {
            handleThePanel();
        }).appendTo("#main-toolbar .buttons");

        todo.on('click', '#cls', function () {
             handleThePanel();
		});
		
		todo.on('click', '#hds', function () {
             hideTop(true);
		});
		
		todo.on('click', '#show', function () {
             hideTop(false);
		});

		load();
		
	});

});
