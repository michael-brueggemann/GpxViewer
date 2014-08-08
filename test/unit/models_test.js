'use strict';

describe('models - ', function() {

	describe('test Point', function() {
		it('toString should work', inject(function() {
			var p1 = new Point(1, 11, 111);
			expect(p1.toString()).toEqual('Point: lat=1, lon=11, ele=111', "Prüfe Point 1");
			var p2 = new Point(2, 22, 222);
			expect(p2.toString()).toEqual('Point: lat=2, lon=22, ele=222', "Prüfe Point 2");
		}));

		it('ele should work', inject(function() {
			var p3 = new Point(3, 33, 333);
			var p4 = new Point(4, 44, 444);
			p3.ele = 300;
			p4.ele = 400;
			expect(p3.ele).toEqual(300);
			expect(p4.ele).toEqual(400);
		}));
	});


	describe('test TrackSegment', function() {
		it('create and add points', inject(function() {
			var p1 = new Point(1, 11, 111);
			var p2 = new Point(2, 22, 222);
			var p3 = new Point(3, 33, 333);
			var p4 = new Point(4, 44, 444);
			var p5 = new Point(5, 55, 555);
			var s1 = new TrackSegment();
			var s2 = new TrackSegment();
			var s3 = new TrackSegment();
			s1.points.push(p1);
			s1.points.push(p2);
			s1.points.push(p3);
			expect(s1.points.length).toBe(3);
			s2.points.push(p4);
			s2.points.push(p5);
			expect(s2.points.length).toBe(2);
			s3.points.push(p5);
			expect(s3.points.length).toBe(1);
			expect(s1.toString()).toEqual('TrackSegment - Anzahl Punkte: 3');
		}));
	});


	describe('test Track', function() {
		it('create and add segments', inject(function() {
			var t1 = new Track('Track1');
			expect(t1.name).toEqual('Track1');
			var t2 = new Track();
			expect(t2.name).toEqual('');
			t2.name = 'Track2';
			expect(t2.name).toEqual('Track2');
			var s1 = new TrackSegment();
			var s2 = new TrackSegment();
			var s3 = new TrackSegment();
			t1.segments.push(s1);
			t1.segments.push(s2);
			expect(t1.segments.length).toBe(2);
			t2.segments.push(s3);
			expect(t2.segments.length).toBe(1);
		}));
	});


	describe('test Tour', function() {
		it('create and add tracks', inject(function() {
			var t1 = new Track('Track1');
			var t2 = new Track();
			var c1 = new Tour();
			c1.tracks.push(t1);
			c1.tracks.push(t2);
			expect(c1.tracks.length).toBe(2);
			var c2 = new Tour();
			c2.tracks.push(t1);
			expect(c2.tracks.length).toBe(1);
		}));
	});

});


