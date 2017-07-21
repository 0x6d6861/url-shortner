$(document).ready(function() {

    $('#table_link').Tabledit({
        url: "/ajax",
        columns: {
            identifier: [0, 'code'],
            editable: [[1, 'link']]
        }
    });

    $('#refesh_btn').on('click', function (event) {
        $("#links-section").load('/links');
        event.preventDefault();
    });

    // process the form
    $('#add_form').submit(function(event) {

        // get the form data
        // there are many ways to get this data using jQuery (you can use the class or id also)
        var formData = {
            'action' : "add",
            'link' : $('#link').val()
        };

        // process the form
        $.ajax({
            type        : 'POST', // define the type of HTTP verb we want to use (POST for our form)
            url         : '/ajax', // the url where we want to POST
            data        : formData, // our data object
            dataType    : 'json', // what type of data do we expect back from the server
            encode          : true
        })
            .done(function(data) {

                // log data to the console so we can see
                console.log(data);
                // here we will handle errors and validation messages
                if ( ! data.code) {

                    $('#message').html('<br><div class="alert alert-danger">' + data.message + '</div>');
                    console.log(data);



                } else {

                    $('#message').html('<br><br><h2><a href=http://bit.ly/' + data.code +'>bit.ly/' + data.code + '</a></h2><br><br>');

                    $("#add_form").trigger('reset');


                    $("#links-section").load('/links');

                }

                // here we will handle errors and validation messages
            });

        // stop the form from submitting the normal way and refreshing the page
        event.preventDefault();
    });

});
