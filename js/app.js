//locations data to be displayed on google maps
var placesData = [{
        title: 'Green Bowl Beach',
        location: {
            lat: -8.848670799999999,
            lng: 115.1710301
        },
        show: true,
        selected: false,
        venueId: '4deb5bc1fa76cc1b8afd1c47'
        
    },
    {
        title: 'Uluwatu Temple',
        location: {
            lat: -8.8150458,
            lng: 115.0886799
        },
        show: true,
        selected: false,
        venueId:'4c3446883896e21eee47eb90'
    },
    {
        title: 'Pantai Pandawa',
        location: {
            lat: -8.845280199999999,
            lng: 115.1870679
        },
        show: true,
        selected: false,
        
    },
    {
        title: 'Sanur Beach',
        location: {
            lat: -8.7071782,
            lng: 115.2626236
        },
        show: true,
        selected: false,
        venueId:'4c33b739213c2d7f546b375d'
    },
    {
        title: 'Tegallalang Rice Terrace',
        location: {
            lat: -8.434040299999999,
            lng: 115.2792569
        },
        show: true,
        selected: false,
        venueId:'527f635e498ecf5c6a42a4bd'
    },
    {
        title: 'Kuta Beach',
        location: {
            lat: -8.718492599999999,
            lng: 115.1686322
        },
        show: true,
        selected: false,
        venueId:'4bc8e2e2762beee119a63d38'
    },
    {
        title: 'Nusa Penida',
        location: {
            lat: -8.727807,
            lng: 115.5444231
        },
        show: true,
        selected: false,
        venueId:'4c0eff73c6cf76b0fbbc8151'
    },
    {
        title: 'Ubud Sacred Monkey Forest',
        location: {
            lat: -8.5187510999,
            lng:  115.2585973
        },
        show: true,
        selected: false,
        venueId:'4fbbb725e4b0d498b41b02d7'
    },
];


var model = function()

{

    var self = this;

    self.errorDisplay = ko.observable('');
    self.mapArray = [];

    for (var i = 0; i < placesData.length; i++) {
        var place = new google.maps.Marker({
            position: {
                lat: placesData[i].location.lat,
                lng: placesData[i].location.lng
            },
            icon: {
            url: "http://maps.google.com/mapfiles/ms/icons/orange-dot.png"
            },

            map: map,
            title: placesData[i].title,
            show: ko.observable(placesData[i].show),
            selected: ko.observable(placesData[i].selected),
            venueid: placesData[i].venueId, 
            animation: google.maps.Animation.DROP
        });

        self.mapArray.push(place);
    }

    // function for marker bounce (animation)
    self.Bounce = function(marker) {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            marker.setAnimation(null);
        }, 350);
    };

    // function to add API information to each marker
    self.addApiInfo = function(marker) {
        $.ajax({
            url: "https://api.foursquare.com/v2/venues/" + marker.venueid + '?client_id=4QLU2NLPZG3WRPUSSNY25XUXCFXU4SDMD2MRRUFHVAH1O2ZT&client_secret=1IWFZJ0DBADNRX1NEPM1JNUY4ZOFDZ4ZP5YKAA0SQPDBTHYH&v=20190101',
            dataType: "json",
            success: function(data) {
                // likes and ratings on the markers
                var result = data.response.venue;

                // to add likes and ratings to marker
                marker.likes = result.hasOwnProperty('likes') ? result.likes.summary : '';
                marker.rating = result.hasOwnProperty('rating') ? result.rating : '';
            },
            
            error: function(e) {
                self.errorDisplay("Foursquare data not available at the moment. API quota exhausted. " );
            }
        });
    };

    //API func
    var addMarkerInfo = function(marker) {

        //add API items to each marker
        self.addApiInfo(marker);

        //add the click event listener to marker
        marker.addListener('click', function() {
            
            self.setSelected(marker);
        });
    };

    //  iterate through mapArray and add marker api info  
    for (var i = 0; i < self.mapArray.length; i++) {
        addMarkerInfo(self.mapArray[i]);
    }

    // create a search text 
    self.searchText = ko.observable('');


    //every keydown is called from input box
    self.filterList = function() {
        //variable for search text
        var currentText = self.searchText();
        infowindow.close();

        //list for user search
        if (currentText.length === 0) {
            self.setAllShow(true);
        } else {
            for (var k = 0; k < self.mapArray.length; k++) {
                // to check whether the searchText is there in the mapArray
                if (self.mapArray[k].title.toLowerCase().indexOf(currentText.toLowerCase()) > -1) {
                    self.mapArray[k].show(true);
                    self.mapArray[k].setVisible(true);
                } else {
                    self.mapArray[k].show(false);
                    self.mapArray[k].setVisible(false);
                }
            }
        }
        infowindow.close();
    };

    // func for markers
    self.setAllShow = function(marker) {
        for (var j = 0; j < self.mapArray.length; j++) {
            self.mapArray[j].show(marker);
            self.mapArray[j].setVisible(marker);
        }
    };

    // function for unselected markers
    self.setAllUnselected = function() {
        for (var i = 0; i < self.mapArray.length; i++) {
            self.mapArray[i].selected(false);
        }   
    };

    self.currentLocation = self.mapArray[0];

    // function for likes and ratings
    self.setSelected = function(location) {
        self.setAllUnselected();
        location.selected(true);

        self.currentLocation = location;

        Likes = function() {
            if (self.currentLocation.likes === '' || self.currentLocation.likes === undefined) {
                return "Likes unavailable";
            } else {
                return "Location has " + self.currentLocation.likes;
            }
        };
        // function to show rating 
        Rating = function() {
            if (self.currentLocation.rating === '' || self.currentLocation.rating === undefined) {
                return "Ratings unavailable";
            } else {
                return "Location is rated " + self.currentLocation.rating;
            }
        };

        var InfoWindow = "<h5>" + self.currentLocation.title + "</h5>" + "<div>" + Likes() + "</div>" + "<div>" + Rating() + "</div>";

        infowindow.setContent(InfoWindow);

        infowindow.open(map, location);
        self.Bounce(location);
    };
};
