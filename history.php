<?php 
    error_reporting( E_ALL );
    ini_set( 'display_errors', true );
    
    if( !session_id() ) { session_start(); }
    
    require_once( 'assets/classes/SteamAuth.php' );
    
    $auth = new SteamAuth();
    $auth->Init();
    
    $page = isset( $_GET['page'] ) ? $_GET['page'] : 1;
?>
<!DOCTYPE html>
<html ng-app="historyApp">
<head>
    <title>CS:GO.WIN - History</title>
    <meta charset="utf-8"/>
    <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <link rel="stylesheet" type="text/css" href="/assets/css/bootstrap.css"/>
    <link rel="stylesheet" type="text/css" href="/assets/css/app.css"/>
    <link rel="stylesheet" type="text/css" href="https://fonts.googleapis.com/css?family=Open+Sans:300,600,700,800">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>
    <script src="http://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.4.8/angular.min.js"></script>
</head>
<body ng-controller="historyController">
<?php include( 'header.php' ) ?>

    <div class="history">
        <div class="container">
            <div class="col-md-12">
                <div class="container-header">
                    <h1 class="container-title">History</h1>
                </div>
                <table class="table history-table">
                    <thead>
                        <tr>
                            <td>Round</td>
                            <td>Percentage</td>
                            <td>Secret</td>
                            <td>Hash</td>
                            <td>Value</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="history-row" ng-repeat-start="jackpot in jackpots" data-target="#history-summary-{{jackpot.round}}" data-toggle="collapse">
                            <td>#{{jackpot.round | number}}</td>
                            <td>{{jackpot.percentage}}%</td>
                            <td>{{jackpot.secret}}</td>
                            <td>{{jackpot.hash}}</td>
                            <td>{{jackpot.value | currency}}</td>
                        </tr>
                        <tr class="history-summary" ng-repeat-end="">    
                            <td colspan="5">
                                <div id="history-summary-{{jackpot.round}}" class="collapse">
                                    <div class="row">
                                        <div class="col-md-6">
                                            <div class="history-winner">
                                                <h5>Winner</h5>
                                                <img ng-src="https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/{{jackpot.avatar}}"/>
                                                <a href="https://steamcommunity.com/profiles/{{jackpot.steamid}}" target="_blank">{{jackpot.username}}</a>
                                            </div>
                                            
                                            <!-- Currently not done -->
                                            
                                        </div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    <script>
        var historyApp = angular.module( 'historyApp', [] );
        
        historyApp.controller( 'historyController', function( $scope, $http ) {
            $http.get( 'http://localhost:3000/api/history/<?php echo $page ?>' ).success( function( data ) {
                $scope.jackpots = data.jackpots;
            })
        })
    </script>
</body>
</html>
