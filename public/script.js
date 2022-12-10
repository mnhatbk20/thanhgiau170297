/*kalmanjs, Wouter Bulten, MIT, https://github.com/wouterbulten/kalmanjs */
var KalmanFilter = function () { "use strict"; function s(t, i) { for (var e = 0; e < i.length; e++) { var s = i[e]; s.enumerable = s.enumerable || !1, s.configurable = !0, "value" in s && (s.writable = !0), Object.defineProperty(t, s.key, s) } } return function () { function v() { var t = 0 < arguments.length && void 0 !== arguments[0] ? arguments[0] : {}, i = t.R, e = void 0 === i ? 1 : i, s = t.Q, n = void 0 === s ? 1 : s, r = t.A, h = void 0 === r ? 1 : r, a = t.B, o = void 0 === a ? 0 : a, u = t.C, c = void 0 === u ? 1 : u; !function (t, i) { if (!(t instanceof i)) throw new TypeError("Cannot call a class as a function") }(this, v), this.R = e, this.Q = n, this.A = h, this.C = c, this.B = o, this.cov = NaN, this.x = NaN } var t, i, e; return t = v, (i = [{ key: "filter", value: function (t) { var i = 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : 0; if (isNaN(this.x)) this.x = 1 / this.C * t, this.cov = 1 / this.C * this.Q * (1 / this.C); else { var e = this.predict(i), s = this.uncertainty(), n = s * this.C * (1 / (this.C * s * this.C + this.Q)); this.x = e + n * (t - this.C * e), this.cov = s - n * this.C * s } return this.x } }, { key: "predict", value: function () { var t = 0 < arguments.length && void 0 !== arguments[0] ? arguments[0] : 0; return this.A * this.x + this.B * t } }, { key: "uncertainty", value: function () { return this.A * this.cov * this.A + this.R } }, { key: "lastMeasurement", value: function () { return this.x } }, { key: "setMeasurementNoise", value: function (t) { this.Q = t } }, { key: "setProcessNoise", value: function (t) { this.R = t } }]) && s(t.prototype, i), e && s(t, e), v }() }();

var delayESP = 1
var stepV = 50
var stepA = 10
var stepPoint = 10
var a = 0
var v0 = 0
var cof = []

function createTable(tableData, table_id) {

	var table = document.createElement('table');
	var tableBody = document.createElement('tbody');


	for (let i = 0; i < tableData[0].length; i++) {

		var row = document.createElement('tr');

		var irow = 0;

		tableData.forEach(function (rowData) {

			var cell = document.createElement('td');
			cell.appendChild(document.createTextNode(rowData[i]));
			row.appendChild(cell);

			irow++;
		});
		tableBody.appendChild(row);
	}




	table.appendChild(tableBody);
	$(`#abc #${table_id}`).html('')
	$(`#abc #${table_id}`).append(table);
}

function ShowEq() {

	$(".eq").show();

	var StrA
	var StrB
	var StrC

	cof[0] = 0.5 * a
	cof[1] = v0
	cof[2] = 0
	StrA = cof[0].toFixed(2) != 0 ? `${(cof[0].toFixed(2).toString())} t^2` : ''
	StrB = cof[1].toFixed(2) != 0 ? ` + ${(cof[1].toFixed(2).toString())} t` : ''
	StrC = cof[2].toFixed(2) != 0 ? ` + ${(cof[2].toFixed(2).toString())}` : ''

	if ((StrA == '') && (StrB == '') && (StrC == '')) {
		$('.eq #eq_s').text("\\(0.0\\)")
	} else {
		$('.eq #eq_s').text(`\\(${StrA + StrB + StrC}\\)`)
	}


	MathJax.typeset()


}


function Draw(rangeX, rangeY, dataX, dataY, title, titleX, titleY, id) {

	var data

	var trace = {
		x: dataX,
		y: dataY,
		type: 'line',

	}


	var layout = {
		autosize: true,

		xaxis: {
			title: {
				text: titleX,
				font: {
					size: 18,
				}
			},


			range: rangeX,

		},
		yaxis: {
			title: {
				text: titleY,
				font: {
					size: 18,
				}
			},
			range: rangeY
		}
	};

	data = [trace]
	Plotly.plot(id, data, layout);
}

function DataRow(fn, Title, stepPoint) {
	var rowTable = []
	rowTable.push(Title)
	for (let i = 0; i < maxLength; i++) {
		if (i % stepPoint == 0) {
			rowTable.push(fn(i))
		}
	}
	return rowTable
}


function round(m, n) {
	return Math.round((m + Number.EPSILON) * Math.pow(10, n)) / Math.pow(10, n);
}


function CalculateData_S(data) {
	dataX1 = []
	dataY1 = []
	for (let i = 0; i < maxLength; i++) {
		dataX1.push(i * delayESP)
	}

	data.forEach(function (item, index) {
		dataY1.push(item)
	})

};

function CalculateData_V(data) {
	dataY2 = []
	dataX2 = []


	var dataDerivated = []

	var kalmanFilter = new KalmanFilter({ R: 0.0015, Q: 3 });
	derivative(data, stepV, dataX2, dataDerivated)

	dataY2 = dataDerivated.map(function (v) {
		return kalmanFilter.filter(v);
	});

};



function CalculateData_A(data) {
	dataX3 = []
	dataY3 = []
	varSign = [-1, 1]
	dataTemp = []


	var dataRg = []
	for (let t = 0; t < data.length; t++) {
		dataRg.push([t, data[t]])
	}
	var cofV = regression.polynomial(dataRg, { order: 2, precision: 10 })
	//m,s
	v0 = cofV.equation[1]
	a = cofV.equation[0] * 1000 * 2

	for (let t = 0; t < data.length; t++) {
		var noise = varSign[Math.floor(Math.random() * 2)] * Math.random() * a * 0.1
		dataX3.push(t)
		dataTemp.push(a + noise)
	}
	var kalmanFilter = new KalmanFilter({ R: 0.005, Q: 3 });
	dataY3 = dataTemp.map(function (v) {
		return kalmanFilter.filter(v);
	});

};




function derivative(yRaw, step, t, dy) {
	var y = []
	var dyRaw = []
	var cof = 1
	var tempT = 0


	for (let i = 0; i < yRaw.length; i += step) {
		y.push(yRaw[i])
	}

	for (let i = 0; i < y.length - 1; i++) {
		dyRaw.push((y[i + 1] - y[i]) / (step))
	}

	// var spline = new Spline(xs, ys);

	for (let j = 0; j < dyRaw.length - 1; j++) {
		cof = (dyRaw[j + 1] - dyRaw[j]) / (step)
		for (let i = 0; i < step; i++) {
			tempT = j * step + i
			t.push(tempT)
			dy.push(cof * i + dyRaw[j])
		}
	}
	for (let i = 0; i < yRaw.length - tempT - 1; i++) {
		t.push(tempT + i + 1)
		dy.push(cof * i + dyRaw[dyRaw.length - 1])
	}
	return
}

function Relayout() {
	var update1 = {
		'xaxis.range': [0, (tempdataY_segment.length - 1) * delayESP],   // updates the xaxis range
	};
	Plotly.relayout('chart1', update1)
	var update2 = {
		'xaxis.range': [0, (dataY2.length - 1) * delayESP],   // updates the xaxis range
	};
	Plotly.relayout('chart2', update2)
	var update3 = {
		'xaxis.range': [0, (dataY3.length - 1) * delayESP],   // updates the xaxis range
	};
	Plotly.relayout('chart3', update3)
}

function Init() {
	$(".eq").hide();

	$("#start").show()
	$("#reset").hide();
	$("#stop").hide()




	$("#start").click(function () {

		$("#start").hide()
		$("#reset").hide();
		$("#stop").show()

		db.ref().update({ 'states/startGetvalue': 1 })
		db.ref().update({ 'states/stopGetvalue': 0 })
	});

	$("#stop").click(function () {
		$("#start").hide()
		$("#reset").hide();
		$("#stop").hide()

		db.ref().update({ 'states/startGetvalue': 0 })
		db.ref().update({ 'states/stopGetvalue': 1 })
	});


	$("#reset").click(function () {
		location.reload();
	});

	$('.detail-info-item').addClass('hide')
	$('.detail-info-item').eq(0).removeClass('hide')
	$(".nav-item").eq(0).addClass('active')

	$(".nav-item").each(function (index) {

		$(this).click(function (e) {
			e.preventDefault();
			$('.detail-info-item').addClass('hide')
			$('.detail-info-item').eq(index).removeClass('hide')
			$(".nav-item").removeClass('active')
			$(".nav-item").eq(index).addClass('active')


			// if (index >=1){
			// 	$(`#chart${index} a[data-val*="reset"]`)[0].click()
			// }

		});
	});
}

var maxLength = 0;

var dataX1 = []
var dataX2 = []
var dataX3 = []

var dataY1 = []
var dataY2 = []
var dataY3 = []

var tempdataY_segment = []
var tempdataX_segment = []

var expectedX = []
var expectedY = []

Init();

var doneEvent = firebase.database().ref('states/done');
doneEvent.on('value', (snapshot) => {
	let data = snapshot.val();
	if (data == 1) {
		getDone();
	}


});


function getDone() {
	$("#start").hide()
	$("#reset").show();
	$("#stop").hide()

	firebase.database().ref('/data').once('value').then((snapshot) => {
		let data = snapshot.val();
		console.log(data)
		data = data.split(",")
		console.log(data)

		maxLength = data.length
		$('#max-time').text(`${maxLength}`)
		$('.select-time-item input').attr('max', `${maxLength}`)
		$('.select-time-item input[name=endTime]').attr('max', `${maxLength}`)
		$('.select-time-item input[name=endTime]').attr('value', `${maxLength}`)


		CalculateData_S(data);
		Draw([0, (maxLength - 1) * delayESP], [0, 1000], dataX1, dataY1, '', 'Thời gian (ms)', 'Tọa độ (mm)', 'chart1')


		$('#submit').click(function (e) {
			e.preventDefault();
			var startTime = parseInt($('#startTime').val())
			var endTime = parseInt($('#endTime').val())


			tempdataY_segment = []
			tempdataX_segment = []

			dataY1.forEach(function (item, index) {
				if ((index >= startTime) && (index <= endTime)) {
					tempdataY_segment.push(item - dataY1[startTime])
				}
			})
			tempdataY_segment.forEach(function (item, index) {
				tempdataX_segment.push(index * delayESP)
			})

			CalculateData_V(tempdataY_segment);
			// CalculateData_A(dataY2);
			CalculateData_A(tempdataY_segment);


			if (chart1.data !== undefined) {
				while (chart1.data.length > 0) {
					Plotly.deleteTraces(chart1, [0]);
				}
			}
			if (chart2.data !== undefined) {
				while (chart2.data.length > 0) {
					Plotly.deleteTraces(chart2, [0]);
				}
			}
			if (chart3.data !== undefined) {
				while (chart3.data.length > 0) {
					Plotly.deleteTraces(chart3, [0]);
				}
			}

			Draw([0, (tempdataY_segment.length - 1) * delayESP], [0, 1000], tempdataX_segment, tempdataY_segment, '', 'Thời gian (ms)', 'Tọa độ (mm)', 'chart1')
			Draw([0, (dataY2.length - 1) * delayESP], [0, 2], dataX2, dataY2, '', 'Thời gian (ms)', 'Vận tốc (m/s)', 'chart2')

			Draw([0, (dataY3.length - 1) * delayESP], [-5, 5], dataX3, dataY3, '', 'Thời gian (ms)', 'Gia tốc (m/s^2', 'chart3')


			var dataTable = []
			maxLength = tempdataY_segment.length
			dataTable.push(DataRow(function (i) { return (i * delayESP).toString() }, "Thời gian (ms)", stepPoint))
			dataTable.push(DataRow(function (i) { return round(tempdataY_segment[i], 2) }, "Tọa độ (mm)", stepPoint))
			dataTable.push(DataRow(function (i) { return round(dataY2[i], 2) }, "Vận tốc (m/s)", stepPoint))

			createTable(dataTable, 'table');
			ShowEq()

			expectedX = []
			expectedY = []
			for (let t = 0; t < tempdataY_segment.length; t++) {
				expectedY.push(cof[0] * t * t / 1000 + cof[1] * t)
				expectedX.push(t)
			}
			Draw([0, (expectedY.length - 1) * delayESP], [0, 1000], expectedX, expectedY, '', 'Thời gian (ms)', 'Tọa độ (mm)', 'chart1')
			// $('#chart1Main').hide()

			Relayout()

			$(".nav-item").each(function (index) {

				$(this).click(function (e) {
					e.preventDefault();
					$('.detail-info-item').addClass('hide')
					$('.detail-info-item').eq(index).removeClass('hide')
					$(".nav-item").removeClass('active')
					$(".nav-item").eq(index).addClass('active')

					Relayout()

				});
			});


		});
		var dataTable = []
		dataTable.push(DataRow(function (i) { return (i * delayESP).toString() }, "Thời gian (ms)", stepPoint))
		dataTable.push(DataRow(function (i) { return round(dataY1[i], 2) }, "Tọa độ (mm)", stepPoint))
		createTable(dataTable, 'table');



	});

	console.log("done?");
}



