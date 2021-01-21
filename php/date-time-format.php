<?php
	$formatDate = "02-02-02 0:0:0";
	if(array_key_exists("datetime", $_GET)) $formatDate = $_GET["datetime"];
	$formatTo = "Y-m-d";
	if(array_key_exists("format", $_GET) && strlen($_GET["format"]) >= 1) $formatTo = $_GET["format"];

	$date = date_create($formatDate);
	header("content-type: application/json");
	header("Access-Control-Allow-Origin: *");
	echo json_encode(date_format($date, $formatTo));
?>