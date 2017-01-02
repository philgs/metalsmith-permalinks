var rimraf = require( 'rimraf' );
var assert = require( 'assert' );
var equal = require( 'assert-dir-equal' );
var Metalsmith = require( 'metalsmith' );
var moment = require( 'moment' );
var permalinks = require( '..' );
var touch = require( 'touch' );
var debug = require( 'metalsmith-debug' );

describe( 'metalsmith-permalinks', function() {
    before( function( done ) {
        rimraf( 'test/fixtures/*/build', done );
    } );

    it( 'should change files even with no pattern', function( done ) {
        Metalsmith( 'test/fixtures/no-pattern' )
            .use( permalinks() )
            .build( function( err ) {
                if ( err ) return done( err );
                equal( 'test/fixtures/no-pattern/expected', 'test/fixtures/no-pattern/build' );
                done();
            } );

    } );

    it( 'should replace a pattern', function( done ) {
        Metalsmith( 'test/fixtures/pattern' )
            .use( permalinks( { pattern: ':title' } ) )
            .build( function( err ) {
                if ( err ) return done( err );
                equal( 'test/fixtures/pattern/expected', 'test/fixtures/pattern/build' );
                done();
            } );

    } );

    it( 'should accepts a shorthand string', function( done ) {
        Metalsmith( 'test/fixtures/shorthand' )
            .use( permalinks( ':title' ) )
            .build( function( err ) {
                if ( err ) return done( err );
                equal( 'test/fixtures/shorthand/expected', 'test/fixtures/shorthand/build' );
                done();
            } );

    } );

    it( 'should copy relative files to maintain references', function( done ) {
        Metalsmith( 'test/fixtures/relative' )
            .use( permalinks() )
            .build( function( err ) {
                if ( err ) return done( err );
                equal( 'test/fixtures/relative/expected', 'test/fixtures/relative/build' );
                done();
            } );
    } );

    it( 'should not copy relative files', function( done ) {
        Metalsmith( 'test/fixtures/no-relative' )
            .use( permalinks( {
                relative: false
            } ) )
            .build( function( err ) {
                if ( err ) return done( err );
                equal( 'test/fixtures/no-relative/expected', 'test/fixtures/no-relative/build' );
                done();
            } );
    } );

    it( 'should copy relative files even with patterns', function( done ) {
        Metalsmith( 'test/fixtures/relative-pattern' )
            .use( permalinks( ':title' ) )
            .build( function( err ) {
                if ( err ) return done( err );
                equal( 'test/fixtures/relative-pattern/expected', 'test/fixtures/relative-pattern/build' );
                done();
            } );
    } );

    it( 'should copy relative files once per output file', function( done ) {
        Metalsmith( 'test/fixtures/relative-multiple' )
            .use( permalinks( ':title' ) )
            .build( function( err ) {
                if ( err ) return done( err );
                equal( 'test/fixtures/relative-multiple/expected', 'test/fixtures/relative-multiple/build' );
                done();
            } );
    } );

    it( 'should format a date', function( done ) {
        Metalsmith( 'test/fixtures/date' )
            .use( permalinks( ':date' ) )
            .build( function( err ) {
                if ( err ) return done( err );
                equal( 'test/fixtures/date/expected', 'test/fixtures/date/build' );
                done();
            } );

    } );

    it( 'should format a date with a custom formatter', function( done ) {
        Metalsmith( 'test/fixtures/custom-date' )
            .use( permalinks( {
                pattern: ':date',
                date: 'YYYY/MM'
            } ) )
            .build( function( err ) {
                if ( err ) return done( err );
                equal( 'test/fixtures/custom-date/expected', 'test/fixtures/custom-date/build' );
                done();
            } );

    } );

    it( 'should replace any backslashes in paths with slashes', function( done ) {
        Metalsmith( 'test/fixtures/backslashes' )
            .use( permalinks() )
            .use( function( files, metalsmith, pluginDone ) {
                Object.keys( files ).forEach( function( file ) {
                    assert.equal( files[ file ].path.indexOf( '\\' ), -1 );
                } );
                pluginDone();
                done();
            } )
            .build( function( err ) {
                if ( err ) return done( err );
            } );

    } );

    it( 'should ignore any files with permalink equal to false option', function( done ) {
        Metalsmith( 'test/fixtures/false-permalink' )
            .use( permalinks( ':title' ) )
            .build( function( err ) {
                if ( err ) return done( err );
                equal( 'test/fixtures/false-permalink/expected', 'test/fixtures/false-permalink/build' );
                done();
            } );
    } );

    it( 'should match arbitrary metadata', function( done ) {
        Metalsmith( 'test/fixtures/simple-linksets' )
            .use( permalinks( {
                linksets: [ {
                    match: { foo: 34 },
                    pattern: 'foo/:title'
                }, {
                    match: { bar: 21 },
                    pattern: 'bar/:title'
                } ]
            } ) )
            .build( function( err ) {
                if ( err ) return done( err );
                equal( 'test/fixtures/simple-linksets/expected', 'test/fixtures/simple-linksets/build' );
                done();
            } );
    } );

    it( 'should format a linkset date with a custom formatter', function( done ) {
        Metalsmith( 'test/fixtures/linkset-custom-date' )
            .use( permalinks( {
                linksets: [ {
                    match: { foo: 34 },
                    pattern: 'foo/:date/:title',
                    date: 'YYYY/MM/DD'
                }, {
                    match: { bar: 21 },
                    pattern: 'bar/:date/:title',
                    date: 'YYYY/MM'
                } ]
            } ) )
            .build( function( err ) {
                if ( err ) return done( err );
                equal( 'test/fixtures/linkset-custom-date/expected', 'test/fixtures/linkset-custom-date/build' );
                done();
            } );
    } );

    it( 'should format a moment object as a date', function( done ) {
        Metalsmith( 'test/fixtures/moment' )
            .use( function( files, metalsmith, done ) {
                Object.keys( files ).forEach( function( file ) {
                    var data = files[ file ];
                    if ( data && data.date ) {
                        data.date = moment( data.date );
                    }
                } );
                done();
            } )
            .use( permalinks( ':date' ) )
            .build( function( err ) {
                if ( err ) return done( err );
                equal( 'test/fixtures/moment/expected', 'test/fixtures/moment/build' );
                done();
            } );
    } );

    it( 'should use a custom date format with other fields', function( done ) {
        Metalsmith( 'test/fixtures/custom-date-fields' )
            .use( permalinks( {
                pattern: 'blog/:date/:title',
                date: 'YYYY/MM'
            } ) )
            .build( function( err ) {
                if ( err ) return done( err );
                equal( 'test/fixtures/custom-date-fields/expected', 'test/fixtures/custom-date-fields/build' );
                done();
            } );
    } );

    it( 'should have an option to use the file\'s "modified" date if there is no "date" metadata', function( done ) {
        // Set the modify and access times for each of the test files; see [this
        // Stack Exchange answer][1] for more information.
        // [1]: http://unix.stackexchange.com/a/2803
        touch.sync( 'test/fixtures/modified-date/src/index.html', {
            time: moment( '2013-10-17', 'YYYY-MM-DD' ).toDate()
        } );
        touch.sync( 'test/fixtures/modified-date/src/one.html', {
            time: moment( '2013-05-23', 'YYYY-MM-DD' ).toDate()
        } );

        Metalsmith( 'test/fixtures/modified-date' )
            .use( permalinks( {
                pattern: ':date',
                useDefaultDate: true
            } ) )
            .use( debug() )
            .build( function( err ) {
                if ( err ) return done( err );
                equal( 'test/fixtures/modified-date/expected', 'test/fixtures/modified-date/build' );
                done();
            } );
    } );

    it( 'should be compatible with the "publishing" plugin and its metadata fields' );

} );
