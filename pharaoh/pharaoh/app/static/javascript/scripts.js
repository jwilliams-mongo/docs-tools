$(document).ready(function(){
    $(".edit").on('click',edit);
    $(".approve").on('click',approve);
    $(".unapprove").on('click',unapprove);
    $(".language").on('click',language);
    $("#show-unapproved-button").on('click',toggle_approved);

    $(".target").each(check_approval);
    $(".target").each(check_editor);
    $('textarea').autosize();

});

function toggle_approved(){
    var newtext = ($(this).html() == "Show All" ? "Only Show Unapproved" : "Show All");
    $(this).html(newtext);
    $('tr').each(function(){
        if($(this).children(".target").data("sentence").status == "approved"){
            $(this).toggle();
        }
    });
}

function check_approval(){
    var approvers= $(this).data('sentence').approvers;
    for(var i=0; i< approvers.length; i++){
        if(approvers[i].$oid == $('#navigation').data('userid')){
            approve_html($(this).children('.approve'));
        }
    }
}

function check_editor(){
    if($('#navigation').data('userid') == $(this).data('sentence').userID.$oid){
        edit_html($(this).children('.edit'));
    }
}

function edit(e){
    edit_html($(this));
}

function edit_html(e){
    e.parent().children(".approve").attr("disabled",true);
    e.parent().children(".edit").html("Save");
    e.parent().children(".target_sentence").attr("readOnly",false);
    e.parent().children(".target_sentence").css("backgroundColor", "#FFFFFF");
    e.parent().children(".edit").off('click').on('click',save);

}

function toggle_message(msg, color){

    $('#error-message').val(msg);
    $('#error-message').css("color",color);
    $("#error-message").show()
    setTimeout(function() {
            $("#error-message").hide()
    }, 3000);

}

function lock_error(json_data){
    window.location.replace('/edit/'+json_data.username+'/'+json_data.target_language+'/'+json_data.file_path+'/423');
}

function save(){
    var new_content={"editor": $("#username").val(), "new_target_sentence": $(this).parent().children(".target_sentence").val()};
    var j={"old": $(this).parent().data("sentence"), "new": new_content};
    $.ajax({
          type: "POST",
          contentType: "application/json; charset=utf-8",
          url: "/add",
          data: JSON.stringify(j),
          dataType: "json",
          success: function(data, textStatus, jqxhr)
                   {
                        toggle_message(data.msg, "green");
                   },
          error: function(data, textStatus, jqxhr)
                   {
                        toggle_message("Error: "+data.responseJSON.msg, "red");
                   }
    });
}

function approve(){
    approve_html($(this));
    var $this=$(this);
    var s=$(this).parent().data("sentence");
    var new_content={"approver": $("#username").val()}
    var j={"old": s, "new": new_content};
    $.ajax({
          type: "POST",
          contentType: "application/json; charset=utf-8",
          url: "/approve",
          data: JSON.stringify(j),
          dataType: "json",
          success: function(data, textStatus, jqxhr)
                   {
                        toggle_message(data.msg, "green");
                        var new_approval_num=parseInt($this.parent().children(".approval_num").val())+1;
                        $this.parent().children(".approval_num").val(new_approval_num);
                   },
          error: function(data, textStatus, jqxhr)
                   {
                        if(data.status == 423){
                            lock_error(data.responseJSON);
                        }
                        else{
                            toggle_message("Error: "+data.responseJSON.msg, "red");
                            unapprove_html($this);
                        }
                   }
    });
}

function approve_html(e){
    e.parent().children(".edit").attr("disabled",true);
    e.parent().children(".approve").html("Unapprove");
    e.parent().children(".approve").off('click').on('click', unapprove);
    e.parent().children(".approve").addClass('unapprove').removeClass('approve');

}
function unapprove(){
    unapprove_html($(this))
    var $this=$(this)
    var s=$(this).parent().data("sentence");
    var new_content={"unapprover": $("#username").val()}
    var j={"old": s, "new": new_content};
    $.ajax({
          type: "POST",
          contentType: "application/json; charset=utf-8",
          url: "/unapprove",
          data: JSON.stringify(j),
          dataType: "json",
          success: function(data, textStatus, jqxhr)
                   {
                        toggle_message(data.msg, "green");
                        var new_approval_num=parseInt($this.parent().children(".approval_num").val())-1;
                        $this.parent().children(".approval_num").val(new_approval_num);
                   },
          error: function(data, textStatus, jqxhr)
                   {
                        toggle_message("Error: "+data.responseJSON.msg, "red");
                        approve_html($this);
                   }
    });
}

function unapprove_html(e){
    e.parent().children(".edit").attr("disabled",false);
    e.parent().children(".unapprove").html("Approve");
    e.parent().children(".edit").off('click').on('click', edit);
    e.parent().children(".unapprove").off('click').on('click', approve);
    e.parent().children(".unapprove").addClass('approve').removeClass('unapprove');

}

function language(){
    window.location.href = 'edit/'+$('#username').val()+'/'+$(this).html();
}
